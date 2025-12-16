import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { FrontendStack } from '../../lib/stack/frontend/frontend-stack';
import { testConfig } from '../test-config';

describe('FrontendStack', () => {
  let app: cdk.App;
  let stack: FrontendStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new FrontendStack(
      app,
      'TestFrontendStack',
      testConfig,
      {
        backendApiUrl: 'https://api.example.com',
        env: {
          account: '123456789012',
          region: 'ap-northeast-1',
        },
      }
    );
    template = Template.fromStack(stack);
  });

  describe('S3 Bucket', () => {
    it('should create an S3 bucket', () => {
      template.resourceCountIs('AWS::S3::Bucket', 1);
    });

    it('should have website configuration', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        WebsiteConfiguration: {
          IndexDocument: 'index.html',
          ErrorDocument: 'index.html',
        },
      });
    });

    it('should block public access initially', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });

    it('should enable versioning', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        VersioningConfiguration: {
          Status: 'Enabled',
        },
      });
    });

    it('should enable server-side encryption', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            {
              ServerSideEncryptionByDefault: {
                SSEAlgorithm: 'AES256',
              },
            },
          ],
        },
      });
    });
  });

  describe('CloudFront Distribution', () => {
    it('should create a CloudFront distribution', () => {
      template.resourceCountIs('AWS::CloudFront::Distribution', 1);
    });

    it('should have correct default root object', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          DefaultRootObject: 'index.html',
        },
      });
    });

    it('should enable IPv6', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          IPV6Enabled: true,
        },
      });
    });

    it('should have price class configured', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          PriceClass: 'PriceClass_200',
        },
      });
    });

    it('should have custom error responses for SPA routing', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          CustomErrorResponses: [
            {
              ErrorCode: 403,
              ResponseCode: 200,
              ResponsePagePath: '/index.html',
              ErrorCachingMinTTL: 300,
            },
            {
              ErrorCode: 404,
              ResponseCode: 200,
              ResponsePagePath: '/index.html',
              ErrorCachingMinTTL: 300,
            },
          ],
        },
      });
    });

    it('should have S3 origin configured', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          Origins: [
            {
              DomainName: {
                'Fn::GetAtt': Match.anyValue(),
              },
              S3OriginConfig: {
                OriginAccessIdentity: {
                  'Fn::Join': Match.anyValue(),
                },
              },
            },
          ],
        },
      });
    });
  });

  describe('Origin Access Identity', () => {
    it('should create CloudFront OAI', () => {
      template.resourceCountIs('AWS::CloudFront::CloudFrontOriginAccessIdentity', 1);
    });
  });

  describe('Bucket Policy', () => {
    it('should create bucket policy for CloudFront access', () => {
      template.resourceCountIs('AWS::S3::BucketPolicy', 1);
    });
  });

  describe('Outputs', () => {
    it('should export CloudFront URL', () => {
      const outputs = template.findOutputs('*');
      expect(Object.keys(outputs)).toContain('CloudFrontUrl');
    });

    it('should export S3 bucket name', () => {
      const outputs = template.findOutputs('*');
      expect(Object.keys(outputs)).toContain('FrontendBucketName');
    });

    it('should export CloudFront distribution ID', () => {
      const outputs = template.findOutputs('*');
      expect(Object.keys(outputs)).toContain('CloudFrontDistributionId');
    });
  });

  describe('Stack Properties', () => {
    it('should synthesize successfully', () => {
      expect(() => app.synth()).not.toThrow();
    });
  });
});

