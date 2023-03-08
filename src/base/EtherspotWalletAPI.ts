import { BigNumber, BigNumberish } from 'ethers';
import {
  EtherspotWallet,
  EtherspotWallet__factory,
  EtherspotWalletFactory,
  EtherspotWalletFactory__factory,
  UserOperationStruct,
} from '../contracts';
import { arrayify, hexConcat } from 'ethers/lib/utils';
import { Signer } from '@ethersproject/abstract-signer';
import { BaseApiParams, BaseAccountAPI } from './BaseAccountAPI';
import { TransactionDetailsForUserOp } from './TransactionDetailsForUserOp';

/**
 * constructor params, added no top of base params:
 * @param owner the signer object for the account owner
 * @param factoryAddress address of contract "factory" to deploy new contracts (not needed if account already deployed)
 * @param index nonce value used when creating multiple accounts for the same owner
 */
export interface EtherspotWalletApiParams extends BaseApiParams {
  owner: Signer;
  factoryAddress?: string;
  index?: number;
}

/**
 * An implementation of the BaseAccountAPI using the EtherspotWallet contract.
 * - contract deployer gets "entrypoint", "owner" addresses and "index" nonce
 * - owner signs requests using normal "Ethereum Signed Message" (ether's signer.signMessage())
 * - nonce method is "nonce()"
 * - execute method is "execFromEntryPoint()"
 */
export class EtherspotWalletAPI extends BaseAccountAPI {
  factoryAddress?: string;
  owner: Signer;
  index: number;

  /**
   * our account contract.
   * should support the "execFromEntryPoint" and "nonce" methods
   */
  accountContract?: EtherspotWallet;

  factory?: EtherspotWalletFactory;

  constructor(params: EtherspotWalletApiParams) {
    super(params);
    this.factoryAddress = params.factoryAddress;
    this.owner = params.owner;
    this.index = params.index ?? 0;
  }

  async _getAccountContract(): Promise<EtherspotWallet> {
    if (this.accountContract == null) {
      this.accountContract = EtherspotWallet__factory.connect(await this.getAccountAddress(), this.provider);
    }
    return this.accountContract;
  }

  /**
   * return the value to put into the "initCode" field, if the account is not yet deployed.
   * this value holds the "factory" address, followed by this account's information
   */
  async getAccountInitCode(): Promise<string> {
    if (this.factory == null) {
      if (this.factoryAddress != null && this.factoryAddress !== '') {
        this.factory = EtherspotWalletFactory__factory.connect(this.factoryAddress, this.provider);
      } else {
        throw new Error('no factory to get initCode');
      }
    }
    return hexConcat([
      this.factory.address,
      `0x5fbfb9cf000000000000000000000000${(await this.owner.getAddress()).slice(
        2,
      )}0000000000000000000000000000000000000000000000000000000000000000`,
    ]);
  }

  async getNonce(): Promise<BigNumber> {
    if (await this.checkAccountPhantom()) {
      return BigNumber.from(0);
    }
    const accountContract = await this._getAccountContract();
    return await accountContract.nonce();
  }

  /**
   * encode a method call from entryPoint to our contract
   * @param target
   * @param value
   * @param data
   */
  async encodeExecute(target: string, value: BigNumberish, data: string): Promise<string> {
    const accountContract = await this._getAccountContract();
    return accountContract.interface.encodeFunctionData('execute', [target, value, data]);
  }

  async signUserOpHash(userOpHash: string): Promise<string> {
    return await this.owner.signMessage(arrayify(userOpHash));
  }

  get epView() {
    return this.entryPointView;
  }
}
