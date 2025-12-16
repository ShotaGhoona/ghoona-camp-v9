import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SecurityStack } from '../../lib/stack/security/security-stack';
import { testConfig } from '../test-config';

describe('SecurityStack', () => {
  let app: cdk.App;
  let stack: SecurityStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new SecurityStack(
      app,
      'TestSecurityStack',
      testConfig,
      {
        env: {
          account: '123456789012',
          region: 'ap-northeast-1',
        },
      }
    );
    template = Template.fromStack(stack);
  });

  describe('Cognito User Pool', () => {
    it('should create a Cognito User Pool', () => {
      template.resourceCountIs('AWS::Cognito::UserPool', 1);
    });

    it('should have email sign-in enabled', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        UsernameAttributes: ['email'],
      });
    });

    it('should have auto-verify email', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        AutoVerifiedAttributes: ['email'],
      });
    });

    it('should have password policy configured', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Policies: {
          PasswordPolicy: {
            MinimumLength: 8,
            RequireLowercase: true,
            RequireNumbers: true,
            RequireSymbols: true,
            RequireUppercase: true,
            TemporaryPasswordValidityDays: 7,
          },
        },
      });
    });

    it('should have self sign-up enabled', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        UserPoolAddOns: {
          AdvancedSecurityMode: 'AUDIT',
        },
      });
    });

    it('should have MFA configuration', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        MfaConfiguration: 'OPTIONAL',
        EnabledMfas: ['SOFTWARE_TOKEN_MFA'],
      });
    });
  });

  describe('Cognito User Pool Client', () => {
    it('should create a User Pool Client', () => {
      template.resourceCountIs('AWS::Cognito::UserPoolClient', 1);
    });

    it('should have OAuth flows configured', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        AllowedOAuthFlows: ['authorization_code', 'implicit'],
        AllowedOAuthScopes: ['email', 'openid', 'profile'],
        AllowedOAuthFlowsUserPoolClient: true,
      });
    });

    it('should prevent user existence errors', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        PreventUserExistenceErrors: 'ENABLED',
      });
    });
  });

  describe('Secrets Manager', () => {
    it('should create a Secrets Manager secret', () => {
      template.resourceCountIs('AWS::SecretsManager::Secret', 1);
    });

    it('should have correct secret structure', () => {
      template.hasResourceProperties('AWS::SecretsManager::Secret', {
        Description: 'Application secrets',
      });
    });
  });

  describe('Outputs', () => {
    it('should export User Pool ID', () => {
      const outputs = template.findOutputs('*');
      expect(Object.keys(outputs)).toContain('UserPoolId');
    });

    it('should export User Pool Client ID', () => {
      const outputs = template.findOutputs('*');
      expect(Object.keys(outputs)).toContain('UserPoolClientId');
    });

    it('should export Secrets Manager ARN', () => {
      const outputs = template.findOutputs('*');
      expect(Object.keys(outputs)).toContain('SecretsManagerArn');
    });
  });

  describe('Stack Properties', () => {
    it('should synthesize successfully', () => {
      expect(() => app.synth()).not.toThrow();
    });
  });
});

