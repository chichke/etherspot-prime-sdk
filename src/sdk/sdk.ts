import { BehaviorSubject } from 'rxjs';
import { State, StateService } from './state';
import { isWalletProvider, WalletProviderLike } from './wallet';
import { SdkOptions } from './interfaces';
import { Network } from "./network";
import { BatchUserOpsRequest, Exception, getGasFee, onRampApiKey, openUrl, UserOpsRequest } from "./common";
import { BigNumber, ethers, providers } from 'ethers';
import { getNetworkConfig, Networks, onRamperAllNetworks } from './network/constants';
import { UserOperationStruct } from './contracts/src/aa-4337/core/BaseAccount';
import { EtherspotWalletAPI, HttpRpcClient, VerifyingPaymasterAPI } from './base';
import { TransactionDetailsForUserOp, TransactionGasInfoForUserOp } from './base/TransactionDetailsForUserOp';
import { CreateSessionDto, OnRamperDto, SignMessageDto, validateDto } from './dto';
import { Session } from '.';
import { ERC20__factory } from './contracts';

/**
 * Prime-Sdk
 *
 * @category Prime-Sdk
 */
export class PrimeSdk {

  private etherspotWallet: EtherspotWalletAPI;
  private bundler: HttpRpcClient;
  private chainId: number;

  private userOpsBatch: BatchUserOpsRequest = { to: [], data: [], value: [] };

  constructor(walletProvider: WalletProviderLike, optionsLike: SdkOptions) {

    if (!isWalletProvider(walletProvider)) {
      throw new Exception('Invalid wallet provider');
    }

    const {
      chainId, //
      rpcProviderUrl,
    } = optionsLike;

    this.chainId = chainId;

    if (!optionsLike.bundlerRpcUrl) {
      const networkConfig = getNetworkConfig(chainId);
      optionsLike.bundlerRpcUrl = networkConfig.bundler;
      if (optionsLike.bundlerRpcUrl == '') throw new Exception('No bundler Rpc provided');
    }


    let provider;

    if (rpcProviderUrl) {
      provider = new providers.JsonRpcProvider(rpcProviderUrl);
    } else provider = new providers.JsonRpcProvider(optionsLike.bundlerRpcUrl);

    let paymasterAPI = null;
    if (optionsLike.paymasterApi && optionsLike.paymasterApi.url) {
      paymasterAPI = new VerifyingPaymasterAPI(optionsLike.paymasterApi.url, Networks[chainId].contracts.entryPoint, optionsLike.paymasterApi.context ?? {})
    }

    this.etherspotWallet = new EtherspotWalletAPI({
      provider,
      walletProvider,
      optionsLike,
      entryPointAddress: Networks[chainId].contracts.entryPoint,
      factoryAddress: Networks[chainId].contracts.walletFactory,
      paymasterAPI,
    })

    this.bundler = new HttpRpcClient(optionsLike.bundlerRpcUrl, Networks[chainId].contracts.entryPoint, Networks[chainId].chainId);

  }


  // exposes
  get state(): StateService {
    return this.etherspotWallet.services.stateService;
  }

  get state$(): BehaviorSubject<State> {
    return this.etherspotWallet.services.stateService.state$;
  }

  get supportedNetworks(): Network[] {
    return this.etherspotWallet.services.networkService.supportedNetworks;
  }

  /**
   * destroys
   */
  destroy(): void {
    this.etherspotWallet.context.destroy();
  }

  // wallet

  /**
   * signs message
   * @param dto
   * @return Promise<string>
   */
  async signMessage(dto: SignMessageDto): Promise<string> {
    const { message } = await validateDto(dto, SignMessageDto);

    await this.etherspotWallet.require({
      network: false,
    });

    return this.etherspotWallet.services.walletService.signMessage(message);
  }

  // session

  /**
   * creates session
   * @param dto
   * @return Promise<Session>
   */
  async createSession(dto: CreateSessionDto = {}): Promise<Session> {
    const { ttl, fcmToken } = await validateDto(dto, CreateSessionDto);

    await this.etherspotWallet.require();

    return this.etherspotWallet.services.sessionService.createSession(ttl, fcmToken);
  }

  async getCounterFactualAddress(): Promise<string> {
    return this.etherspotWallet.getCounterFactualAddress();
  }

  async estimate(gasDetails?: TransactionGasInfoForUserOp) {
    if (this.userOpsBatch.to.length < 1) {
      throw new Error("cannot sign empty transaction batch");
    }

    const tx: TransactionDetailsForUserOp = {
      target: this.userOpsBatch.to,
      values: this.userOpsBatch.value,
      data: this.userOpsBatch.data,
      ...gasDetails,
    }

    let partialtx = await this.etherspotWallet.createUnsignedUserOp({
      ...tx,
      maxFeePerGas: 1,
      maxPriorityFeePerGas: 1,
    });

    const bundlerGasEstimate = await this.bundler.getVerificationGasInfo(partialtx);

    // if estimation has gas prices use them, otherwise fetch them in a separate call
    if (bundlerGasEstimate.maxFeePerGas && bundlerGasEstimate.maxPriorityFeePerGas) {
      partialtx.maxFeePerGas = bundlerGasEstimate.maxFeePerGas;
      partialtx.maxPriorityFeePerGas = bundlerGasEstimate.maxPriorityFeePerGas;
    } else {
      const gas = await this.getGasFee();
      partialtx.maxFeePerGas = gas.maxFeePerGas;
      partialtx.maxPriorityFeePerGas = gas.maxPriorityFeePerGas;
    }

    if (bundlerGasEstimate.preVerificationGas) {
      partialtx.preVerificationGas = BigNumber.from(bundlerGasEstimate.preVerificationGas);
      partialtx.verificationGasLimit = BigNumber.from(bundlerGasEstimate.verificationGasLimit ?? bundlerGasEstimate.verificationGas);
      partialtx.callGasLimit = BigNumber.from(bundlerGasEstimate.callGasLimit);
    }

    return partialtx;

  }

  async getGasFee() {
    const version = await this.bundler.getBundlerVersion();
    if (version.includes('skandha'))
      return this.bundler.getSkandhaGasPrice();
    return getGasFee(this.etherspotWallet.provider as providers.JsonRpcProvider);
  }

  async send(userOp: UserOperationStruct) {
    const signedUserOp = await this.etherspotWallet.signUserOp(userOp);
    return this.bundler.sendUserOpToBundler(signedUserOp);
  }

  async getNativeBalance() {
    if (!this.etherspotWallet.accountAddress) {
      await this.getCounterFactualAddress();
    }
    const balance = await this.etherspotWallet.provider.getBalance(this.etherspotWallet.accountAddress);
    return ethers.utils.formatEther(balance);
  }

  async getTokenBalance(tokenAddress: string) {
    if (!this.etherspotWallet.accountAddress) {
      await this.getCounterFactualAddress();
    }
    const token = ethers.utils.getAddress(tokenAddress);
    const erc20Contract = ERC20__factory.connect(token, this.etherspotWallet.services.walletService.getWalletProvider());
    const dec = await erc20Contract.functions.decimals();
    const balance = await erc20Contract.functions.balanceOf(this.etherspotWallet.accountAddress)
    return ethers.utils.formatUnits(balance[0], dec);
  }

  async getUserOpReceipt(userOpHash: string) {
    return this.bundler.getUserOpsReceipt(userOpHash);
  }

  async getUserOpHash(userOp: UserOperationStruct) {
    return this.etherspotWallet.getUserOpHash(userOp);
  }

  async addUserOpsToBatch(
    tx: UserOpsRequest,
  ): Promise<BatchUserOpsRequest> {
    if (!tx.data && !tx.value) throw new Error('Data and Value both cannot be empty');
    this.userOpsBatch.to.push(tx.to);
    this.userOpsBatch.value.push(tx.value ?? BigNumber.from(0));
    this.userOpsBatch.data.push(tx.data ?? '0x');
    return this.userOpsBatch;
  }

  async clearUserOpsFromBatch(): Promise<void> {
    this.userOpsBatch.to = [];
    this.userOpsBatch.data = [];
    this.userOpsBatch.value = [];
  }

  async getAccountContract() {
    return this.etherspotWallet._getAccountContract();
  }

  async totalGasEstimated(userOp: UserOperationStruct): Promise<BigNumber> {
    const callGasLimit = BigNumber.from(await userOp.callGasLimit);
    const verificationGasLimit = BigNumber.from(await userOp.verificationGasLimit);
    const preVerificationGas = BigNumber.from(await userOp.preVerificationGas);
    return callGasLimit.add(verificationGasLimit).add(preVerificationGas);
  }

  async getFiatOnRamp(params: OnRamperDto = {}) {
    if (!params.onlyCryptoNetworks) params.onlyCryptoNetworks = onRamperAllNetworks.join(',');
    else {
      const networks = params.onlyCryptoNetworks.split(',');
      for (const network in networks) {
        if (!onRamperAllNetworks.includes(network)) throw new Error('Included Networks which are not supported. Please Check');
      }
    }

    const url = `https://buy.onramper.com/?networkWallets=ETHEREUM:${await this.getCounterFactualAddress()}` +
      `&apiKey=${onRampApiKey}` +
      `&onlyCryptoNetworks=${params.onlyCryptoNetworks}` +
      `${params.defaultCrypto ? `&defaultCrypto=${params.defaultCrypto}` : ``}` +
      `${params.excludeCryptos ? `&excludeCryptos=${params.excludeCryptos}` : ``}` +
      `${params.onlyCryptos ? `&onlyCryptos=${params.onlyCryptos}` : ``}` +
      `${params.excludeCryptoNetworks ? `&excludeCryptoNetworks=${params.excludeCryptoNetworks}` : ``}` +
      `${params.defaultAmount ? `&defaultCrypto=${params.defaultAmount}` : ``}` +
      `${params.defaultFiat ? `&defaultFiat=${params.defaultFiat}` : ``}` +
      `${params.isAmountEditable ? `&isAmountEditable=${params.isAmountEditable}` : ``}` +
      `${params.onlyFiats ? `&onlyFiats=${params.onlyFiats}` : ``}` +
      `${params.excludeFiats ? `&excludeFiats=${params.excludeFiats}` : ``}` +
      `&themeName=${params.themeName ?? 'dark'}`;
    
    if (typeof window === 'undefined') {
      openUrl(url);
    } else {
      window.open(url);
    }

    return url;
  }

}
