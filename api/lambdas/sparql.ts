import got from 'got';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { URL } from 'url';
import { pick } from 'lodash';

export const getStringFromEnv = (key: string): string | Error =>
  process.env[key] || new Error(`${key} not set`);

export const okResponse = (
  contentType: string,
  body: string
): APIGatewayProxyResult => ({
  statusCode: 200,
  headers: { 'Content-Type': contentType },
  body,
});

export const badRequestResponse = (
  body: string,
  contentType?: string
): APIGatewayProxyResult => ({
  statusCode: 400,
  headers: { 'Content-Type': contentType ?? 'text/plain' },
  body,
});

export const internalServerErrorResponse: APIGatewayProxyResult = {
  statusCode: 500,
  headers: { 'Content-Type': 'text/plain' },
  body: 'Internal Server Error',
};

export const badGatewayResponse: APIGatewayProxyResult = {
  statusCode: 502,
  headers: { 'Content-Type': 'text/plain' },
  body: 'Bad Gateway',
};

export type PostSparqlEvent = Pick<APIGatewayProxyEventV2, 'body'>;

export const handler = async (
  event: PostSparqlEvent
): Promise<APIGatewayProxyResult> => {
  const { body: query } = event;

  const sparqlUrlString = getStringFromEnv('SPARQL_URL');

  if (sparqlUrlString instanceof Error) {
    console.log('SPARQL_URL not set');
    return internalServerErrorResponse;
  }

  let sparqlUrl: URL;
  try {
    sparqlUrl = new URL(sparqlUrlString);
  } catch {
    console.log(`Invalid SPARQL_URL: ${sparqlUrlString}`);
    return internalServerErrorResponse;
  }

  if (!query) {
    return badRequestResponse('Missing query parameter for POST request');
  }

  const response = await got.post(
    sparqlUrl,
    {
      form: { query },
      throwHttpErrors: false,
      https: {
        rejectUnauthorized: sparqlUrl.hostname !== 'localhost',
      },
    }
  );

  const contentType = response.headers['content-type'];

  if (!contentType) return badGatewayResponse;

  if (response.statusCode === 400) {
    return badRequestResponse(response.body, contentType);
  }

  if (response.statusCode !== 200) {
    const responseToLog = pick(response, ['statusCode', 'headers', 'body']);

    console.log(
      'Unexpected server response:',
      JSON.stringify(responseToLog, undefined, 2)
    );

    return internalServerErrorResponse;
  }

  return okResponse(contentType, response.body);
};
