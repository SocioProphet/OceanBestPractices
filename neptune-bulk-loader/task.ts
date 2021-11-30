import { z } from 'zod';
import { isError } from 'lodash';
import * as osClient from '../lib/open-search-client';
import * as s3Utils from '../lib/s3-utils';
import {
  BulkLoaderDataFormatSchema,
  NeptuneBulkLoaderClient,
} from './neptune-bulk-loader-client';
import { getBoolFromEnv, getStringFromEnv } from '../lib/env-utils';

const createTermsIndex = async (
  esUrl: string,
  index: string
): Promise<void> => {
  try {
    await osClient.createTermsIndex(esUrl, index);
  } catch (error) {
    if (
      !isError(error)
      || error.message !== 'resource_already_exists_exception'
    ) throw error;
  }
};

const metadataSchema = z.object({
  source: z.string().url(),
  format: BulkLoaderDataFormatSchema,
  namedGraphUri: z.string().url(),
});

type MainResult = Error | undefined;

export const neptuneBulkLoader = async (): Promise<MainResult> => {
  const iamRoleArn = getStringFromEnv('IAM_ROLE_ARN');
  const insecureHttps = getBoolFromEnv('INSECURE_HTTPS', false);
  const metadataUrl = getStringFromEnv('S3_TRIGGER_OBJECT');
  const neptuneUrl = getStringFromEnv('NEPTUNE_URL');
  const region = getStringFromEnv('AWS_REGION');
  const esUrl = getStringFromEnv('ES_URL');
  const termsIndex = getStringFromEnv('ES_TERMS_INDEX');

  const bulkLoaderClient = new NeptuneBulkLoaderClient({
    neptuneUrl,
    iamRoleArn,
    region,
    insecureHttps,
  });

  console.log(`Metadata URL: ${metadataUrl}`);

  const metadataLocation = s3Utils.S3ObjectLocation.fromS3Url(metadataUrl);

  const rawMetadata = await s3Utils.getObjectJson(metadataLocation);

  const metadata = metadataSchema.parse(rawMetadata);

  console.log('Metadata:', JSON.stringify(metadata));

  const loadId = await bulkLoaderClient.load({
    source: metadata.source,
    format: metadata.format,
    namedGraphUri: metadata.namedGraphUri,
  });

  console.log(`loadId: ${loadId}`);

  await bulkLoaderClient.waitForLoadCompleted(loadId);

  await createTermsIndex(esUrl, termsIndex);

  return undefined;
};

if (require.main === module) {
  neptuneBulkLoader()
    .then((r) => console.log('Result:', r))
    .catch((error) => console.log('Error:', error));
}
