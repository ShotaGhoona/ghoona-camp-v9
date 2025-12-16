import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { DatabaseResource } from '../../lib/resource/database-resource';

describe('DatabaseResource', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let vpc: ec2.IVpc;
  let databaseResource: DatabaseResource;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack', {
      env: {
        account: '123456789012',
        region: 'ap-northeast-1',
      },
    });

    vpc = new ec2.Vpc(stack, 'TestVpc', {
      maxAzs: 2,
    });

    databaseResource = new DatabaseResource(stack, 'TestDatabase', {
      vpc,
      enableDynamo: true,
      dynamoTableName: 'test-table',
      enableAurora: true,
      enableRds: false,
      engineType: 'postgres',
      auroraClusterName: 'test-cluster',
      s3BucketName: 'test-bucket',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    template = Template.fromStack(stack);
  });

  describe('DynamoDB Table', () => {
    it('should create a DynamoDB table', () => {
      template.resourceCountIs('AWS::DynamoDB::Table', 1);
    });

    it('should export dynamoTable property', () => {
      expect(databaseResource.dynamoTable).toBeDefined();
      expect(databaseResource.dynamoTable!.tableName).toBeDefined();
    });

    it('should have correct key schema', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        KeySchema: [
          {
            AttributeName: 'pk',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'sk',
            KeyType: 'RANGE',
          },
        ],
      });
    });
  });

  describe('Aurora Cluster', () => {
    it('should create an Aurora cluster', () => {
      template.resourceCountIs('AWS::RDS::DBCluster', 1);
    });

    it('should export auroraCluster property', () => {
      expect(databaseResource.auroraCluster).toBeDefined();
    });

    it('should have Aurora endpoint', () => {
      expect(databaseResource.auroraCluster?.clusterEndpoint).toBeDefined();
    });

    it('should export database security group', () => {
      expect(databaseResource.databaseSecurityGroup).toBeDefined();
    });
  });

  describe('S3 Bucket', () => {
    it('should create an S3 bucket', () => {
      template.resourceCountIs('AWS::S3::Bucket', 1);
    });

    it('should export s3Bucket property', () => {
      expect(databaseResource.s3Bucket).toBeDefined();
      expect(databaseResource.s3Bucket.bucketName).toBeDefined();
    });

    it('should enable versioning', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        VersioningConfiguration: {
          Status: 'Enabled',
        },
      });
    });

    it('should block public access', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });
  });
});

