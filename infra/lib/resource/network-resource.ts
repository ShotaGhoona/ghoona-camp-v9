import { Construct } from 'constructs';
import { VpcConstruct } from '../construct/networking/vpc-construct';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface NetworkResourceProps {
  /**
   * VPC名
   */
  vpcName: string;
  /**
   * VPCのCIDR
   * @default '10.0.0.0/16'
   */
  cidr?: string;
  /**
   * Availability Zoneの数
   * @default 2
   */
  maxAzs?: number;
  /**
   * NATゲートウェイの数
   * @default 1
   */
  natGateways?: number;
}

/**
 * レイヤー2: ネットワークResource（機能単位）
 * 
 * 責務: ネットワーク基盤全体を提供
 * - VPC
 * - サブネット（パブリック/プライベート）
 * - インターネットゲートウェイ
 * - NATゲートウェイ
 * - ルートテーブル
 * 
 * 含まれるConstruct: VpcConstruct
 * 
 * 変更頻度: まれ（テンプレートの改善時）
 */
export class NetworkResource extends Construct {
  public readonly vpc: ec2.IVpc;
  public readonly publicSubnets: ec2.ISubnet[];
  public readonly privateSubnets: ec2.ISubnet[];

  constructor(scope: Construct, id: string, props: NetworkResourceProps) {
    super(scope, id);

    // VPCの作成（Construct層を使用）
    const vpcConstruct = new VpcConstruct(this, 'VpcConstruct', {
      vpcName: props.vpcName,
      cidr: props.cidr,
      maxAzs: props.maxAzs,
      natGateways: props.natGateways,
    });

    this.vpc = vpcConstruct.vpc;
    this.publicSubnets = vpcConstruct.publicSubnets;
    this.privateSubnets = vpcConstruct.privateSubnets;
  }
}

