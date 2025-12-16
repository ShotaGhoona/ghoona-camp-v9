import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { NetworkResource } from '../../lib/resource/network-resource';

describe('NetworkResource', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let networkResource: NetworkResource;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');
    
    networkResource = new NetworkResource(stack, 'TestNetwork', {
      vpcName: 'test-vpc',
      cidr: '10.0.0.0/16',
      maxAzs: 2,
      natGateways: 1,
    });

    template = Template.fromStack(stack);
  });

  describe('VPC', () => {
    it('should create a VPC with correct configuration', () => {
      template.resourceCountIs('AWS::EC2::VPC', 1);
      template.hasResourceProperties('AWS::EC2::VPC', {
        CidrBlock: '10.0.0.0/16',
        EnableDnsHostnames: true,
        EnableDnsSupport: true,
      });
    });

    it('should export vpc property', () => {
      expect(networkResource.vpc).toBeDefined();
      expect(networkResource.vpc.vpcId).toBeDefined();
    });
  });

  describe('Subnets', () => {
    it('should create subnets across multiple AZs', () => {
      // 2 AZs * 3 subnet types (public, private, isolated)
      template.resourceCountIs('AWS::EC2::Subnet', 6);
    });

    it('should export publicSubnets', () => {
      expect(networkResource.publicSubnets).toBeDefined();
      expect(networkResource.publicSubnets.length).toBeGreaterThan(0);
    });

    it('should export privateSubnets', () => {
      expect(networkResource.privateSubnets).toBeDefined();
      expect(networkResource.privateSubnets.length).toBeGreaterThan(0);
    });

    // Note: NetworkResource only exposes public and private subnets
    // Isolated subnets are available through vpc.isolatedSubnets if needed
  });

  describe('Internet Gateway', () => {
    it('should create an Internet Gateway', () => {
      template.resourceCountIs('AWS::EC2::InternetGateway', 1);
    });
  });

  describe('NAT Gateway', () => {
    it('should create NAT Gateway based on configuration', () => {
      template.resourceCountIs('AWS::EC2::NatGateway', 1);
    });
  });

  describe('Route Tables', () => {
    it('should create route tables for different subnet types', () => {
      // Public + Private + Isolated route tables
      template.resourceCountIs('AWS::EC2::RouteTable', 4);
    });
  });
});

