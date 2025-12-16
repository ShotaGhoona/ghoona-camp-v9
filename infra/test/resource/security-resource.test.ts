import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SecurityResource } from '../../lib/resource/security-resource';

describe('SecurityResource', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let securityResource: SecurityResource;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');
    
    securityResource = new SecurityResource(stack, 'TestSecurity', {
      userPoolName: 'test-pool',
      userPoolClientName: 'test-client',
      secretName: 'test/secrets',
    });

    template = Template.fromStack(stack);
  });

  describe('Cognito User Pool', () => {
    it('should create a Cognito User Pool', () => {
      template.resourceCountIs('AWS::Cognito::UserPool', 1);
    });

    it('should export userPool property', () => {
      expect(securityResource.userPool).toBeDefined();
    });

    it('should have email sign-in enabled', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        UsernameAttributes: ['email'],
      });
    });
  });

  describe('Cognito User Pool Client', () => {
    it('should create a User Pool Client', () => {
      template.resourceCountIs('AWS::Cognito::UserPoolClient', 1);
    });

    it('should export userPoolClient property', () => {
      expect(securityResource.userPoolClient).toBeDefined();
    });
  });

  describe('Secrets Manager', () => {
    it('should create a Secrets Manager secret', () => {
      template.resourceCountIs('AWS::SecretsManager::Secret', 1);
    });

    it('should export secret property', () => {
      expect(securityResource.secret).toBeDefined();
    });

    it('should have correct secret structure', () => {
      template.hasResourceProperties('AWS::SecretsManager::Secret', {
        Description: 'Application secrets',
      });
    });
  });
});

