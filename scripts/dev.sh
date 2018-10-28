#!/usr/bin/env bash

# Adapted from https://github.com/Giftbit/sam-scaffold

# A few bash commands to make development against dev environment easy.
# Set the properties below to sensible values for your project.

# The name of your CloudFormation stack.  Two developers can share a stack by
# sharing this value, or have their own with different values.
STACK_NAME="rhtodo-dev-$USER"

# The name of an S3 bucket on your account to hold deployment artifacts.
BUILD_ARTIFACT_BUCKET="rhtodo-code-$USER"

# Parameter values for the sam template.  see: `aws cloudformation deploy help`
PARAMETER_OVERRIDES=""
#PARAMETER_OVERRIDES="--parameter-overrides"
#PARAMETER_OVERRIDES+=" KeyOne=value"
#PARAMETER_OVERRIDES+=" KeyTwo=value"

USAGE="usage: $0 <command name>\nvalid command names: delete deploy invoke upload"


set -eu

if ! type "aws" &> /dev/null; then
    echo "'aws' was not found in the path.  Install awscli and try again."
    exit 1
fi

if [ $# -lt 1 ]; then
    echo "Error: expected a command."
    echo -e $USAGE
    exit 1
fi

COMMAND="$1"
case "$COMMAND" in
delete)
    aws cloudformation delete-stack --stack-name $STACK_NAME
    ;;
deploy)
    npm run build
    ;&
deploy-infrastructure)
    OUTPUT_TEMPLATE_FILE="/tmp/SamDeploymentTemplate.`date "+%s"`.yaml"
    aws cloudformation package --template-file infrastructure/sam.yaml --s3-bucket $BUILD_ARTIFACT_BUCKET --output-template-file "$OUTPUT_TEMPLATE_FILE"

    echo "Executing aws cloudformation deploy..."
    aws cloudformation deploy --template-file "$OUTPUT_TEMPLATE_FILE" --stack-name $STACK_NAME --capabilities CAPABILITY_IAM $PARAMETER_OVERRIDES
    rm "$OUTPUT_TEMPLATE_FILE"
    ;;
invoke)
    if [ "$#" -ne 3 ]; then
        echo "Supply a function name to invoke and json file to invoke with.  eg: $0 invoke myfunction myfile.json"
        exit 1
    fi

    FXN="$2"
    JSON_FILE="$3"

    if [ ! -d "./src/lambdas/$FXN" ]; then
        echo "$FXN is not the directory of a lambda function in src/lambdas."
        exit 2
    fi

    if [ ! -f $JSON_FILE ]; then
        echo "$JSON_FILE does not exist.";
        exit 3
    fi

    # Search for the ID of the function assuming it was named something like FxnFunction where Fxn is the uppercased form of the dir name.
    FXN_UPPERCASE="$(tr '[:lower:]' '[:upper:]' <<< ${FXN:0:1})${FXN:1}"
    FXN_ID="$(aws cloudformation describe-stack-resources --stack-name $STACK_NAME --query "StackResources[?ResourceType==\`AWS::Lambda::Function\`&&starts_with(LogicalResourceId,\`$FXN_UPPERCASE\`)].PhysicalResourceId" --output text)"
    if [ $? -ne 0 ]; then
        echo "Could not discover the LogicalResourceId of $FXN.  Check that there is a ${FXN_UPPER_CAMEL_CASE}Function Resource inside infrastructure/sam.yaml and check that it has been deployed."
        exit 1
    fi

    aws --cli-read-timeout 300 lambda invoke --function-name $FXN_ID --payload fileb://$JSON_FILE /dev/stdout
    ;;
upload)
    # Upload new lambda function code.
    # eg: ./dev.sh upload myfunction

    if [ "$#" -ne 2 ]; then
        echo "Supply a function name to build and upload.  eg: $0 upload myfunction"
        exit 1
    fi

    FXN="$2"

    if [ ! -d "./src/lambdas/$FXN" ]; then
        echo "$FXN is not the directory of a lambda function in src/lambdas."
        exit 2
    fi

    npm run build -- --env.fxn=$FXN

    # Search for the ID of the function assuming it was named something like FxnFunction where Fxn is the uppercased form of the dir name.
    FXN_UPPERCASE="$(tr '[:lower:]' '[:upper:]' <<< ${FXN:0:1})${FXN:1}"
    FXN_ID="$(aws cloudformation describe-stack-resources --stack-name $STACK_NAME --query "StackResources[?ResourceType==\`AWS::Lambda::Function\`&&starts_with(LogicalResourceId,\`$FXN_UPPERCASE\`)].PhysicalResourceId" --output text)"
    if [ $? -ne 0 ]; then
        echo "Could not discover the LogicalResourceId of $FXN.  Check that there is a ${FXN_UPPER_CAMEL_CASE}Function Resource inside infrastructure/sam.yaml and check that it has been deployed."
        exit 1
    fi

    aws lambda update-function-code --function-name $FXN_ID --zip-file fileb://./dist/$FXN/$FXN.zip
    ;;
*)
    echo "Error: unknown command name '$COMMAND'."
    echo -e $USAGE
    exit 2
esac
