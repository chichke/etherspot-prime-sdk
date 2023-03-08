/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  TestOracle,
  TestOracleInterface,
} from "../../../../src/aa-4337/test/TestOracle";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "ethOutput",
        type: "uint256",
      },
    ],
    name: "getTokenValueOfEth",
    outputs: [
      {
        internalType: "uint256",
        name: "tokenInput",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506101c7806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063d1eca9cf14610030575b600080fd5b61004a600480360381019061004591906100b1565b610060565b60405161005791906100ed565b60405180910390f35b600060028261006f9190610137565b9050919050565b600080fd5b6000819050919050565b61008e8161007b565b811461009957600080fd5b50565b6000813590506100ab81610085565b92915050565b6000602082840312156100c7576100c6610076565b5b60006100d58482850161009c565b91505092915050565b6100e78161007b565b82525050565b600060208201905061010260008301846100de565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006101428261007b565b915061014d8361007b565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff048311821515161561018657610185610108565b5b82820290509291505056fea2646970667358221220e586b7e28ee081659dcb8de8ca6dbe3638946addabdcc46acc7392477e81c4d364736f6c634300080c0033";

type TestOracleConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TestOracleConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TestOracle__factory extends ContractFactory {
  constructor(...args: TestOracleConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<TestOracle> {
    return super.deploy(overrides || {}) as Promise<TestOracle>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): TestOracle {
    return super.attach(address) as TestOracle;
  }
  override connect(signer: Signer): TestOracle__factory {
    return super.connect(signer) as TestOracle__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TestOracleInterface {
    return new utils.Interface(_abi) as TestOracleInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TestOracle {
    return new Contract(address, _abi, signerOrProvider) as TestOracle;
  }
}
