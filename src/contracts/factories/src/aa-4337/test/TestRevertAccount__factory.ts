/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  PayableOverrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  TestRevertAccount,
  TestRevertAccountInterface,
} from "../../../../src/aa-4337/test/TestRevertAccount";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IEntryPoint",
        name: "_ep",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "length",
        type: "uint256",
      },
    ],
    name: "revertLong",
    outputs: [],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "initCode",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "callGasLimit",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "verificationGasLimit",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "preVerificationGas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxFeePerGas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxPriorityFeePerGas",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "paymasterAndData",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes",
          },
        ],
        internalType: "struct UserOperation",
        name: "",
        type: "tuple",
      },
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "missingAccountFunds",
        type: "uint256",
      },
    ],
    name: "validateUserOp",
    outputs: [
      {
        internalType: "uint256",
        name: "validationData",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x6080604052604051610435380380610435833981810160405281019061002591906100e0565b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505061010d565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061009b82610070565b9050919050565b60006100ad82610090565b9050919050565b6100bd816100a2565b81146100c857600080fd5b50565b6000815190506100da816100b4565b92915050565b6000602082840312156100f6576100f561006b565b5b6000610104848285016100cb565b91505092915050565b6103198061011c6000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80633a871cdd1461003b578063be76c6ef1461006b575b600080fd5b610055600480360381019061005091906101c1565b610087565b604051610062919061023f565b60405180910390f35b6100856004803603810190610080919061025a565b610121565b005b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663b760faf983306040518363ffffffff1660e01b81526004016100e491906102c8565b6000604051808303818588803b1580156100fd57600080fd5b505af1158015610111573d6000803e3d6000fd5b5050505050600090509392505050565b806000fd5b600080fd5b600080fd5b600080fd5b6000610160828403121561014c5761014b610130565b5b81905092915050565b6000819050919050565b61016881610155565b811461017357600080fd5b50565b6000813590506101858161015f565b92915050565b6000819050919050565b61019e8161018b565b81146101a957600080fd5b50565b6000813590506101bb81610195565b92915050565b6000806000606084860312156101da576101d9610126565b5b600084013567ffffffffffffffff8111156101f8576101f761012b565b5b61020486828701610135565b935050602061021586828701610176565b9250506040610226868287016101ac565b9150509250925092565b6102398161018b565b82525050565b60006020820190506102546000830184610230565b92915050565b6000602082840312156102705761026f610126565b5b600061027e848285016101ac565b91505092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006102b282610287565b9050919050565b6102c2816102a7565b82525050565b60006020820190506102dd60008301846102b9565b9291505056fea2646970667358221220a7812233e7712b8823d42af00ebc96b190dfb22476fb7c675dfb29743b82e9b664736f6c634300080c0033";

type TestRevertAccountConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TestRevertAccountConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TestRevertAccount__factory extends ContractFactory {
  constructor(...args: TestRevertAccountConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _ep: PromiseOrValue<string>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<TestRevertAccount> {
    return super.deploy(_ep, overrides || {}) as Promise<TestRevertAccount>;
  }
  override getDeployTransaction(
    _ep: PromiseOrValue<string>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_ep, overrides || {});
  }
  override attach(address: string): TestRevertAccount {
    return super.attach(address) as TestRevertAccount;
  }
  override connect(signer: Signer): TestRevertAccount__factory {
    return super.connect(signer) as TestRevertAccount__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TestRevertAccountInterface {
    return new utils.Interface(_abi) as TestRevertAccountInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TestRevertAccount {
    return new Contract(address, _abi, signerOrProvider) as TestRevertAccount;
  }
}
