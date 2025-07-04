import {ApiResponseOptions} from '@nestjs/swagger';
import {SchemaObject} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

interface ExtraQueryParameterDto {
  name: string;
  type: string;
  description: string;
  isRequired: boolean;
}

export const SWAGGER_RESPONSE = <T extends Partial<ApiResponseOptions>>(
  statusCode: number,
  resource: string,
  isPaginated = false,
  extraOptions?: T,
): ApiResponseOptions & T => {
  const baseDescriptions = {
    200: `The ${resource} was successfully processed.`,
    400: `Invalid request. Please check the input for the ${resource}.`,
    401: 'Unauthorized. Please, check your credentials.',
    403: 'Access forbidden. You do not have the necessary permissions to access this resource.',
    404: `${resource} not found. No ${resource} exists with the provided ID.`,
    500: `An internal server error occurred while processing the ${resource}. Please try again later.`,
  };

  resource = pluralize(resource);
  const paginatedDescriptions = {
    200: `A list of ${resource}, successfully retrieved and paginated.`,
    204: `A list of ${resource}, successfully deleted.`,
    400: `Invalid query parameters or pagination settings for retrieving ${resource}.`,
    500: `An internal server error occurred while retrieving the list of ${resource}. Please try again later.`,
  };

  const description = isPaginated
    ? paginatedDescriptions[statusCode]
    : baseDescriptions[statusCode];

  return {
    status: statusCode,
    description,
    schema: {} as SchemaObject,
    ...(extraOptions as ApiResponseOptions),
  } as ApiResponseOptions & T;
};

export const SWAGGER_OPERATION = (
  resource: string,
  isPaginated: boolean = false,
  extraQueryParameters?: ExtraQueryParameterDto[],
  isActiveProperty: boolean = true,
  hasActiveOrChangeStatusProperty: boolean = true,
  customSummary?: string,
  customDescription?: string,
): {summary: string; description: string} => {
  resource = isPaginated ? pluralize(resource) : resource;

  const summary = isPaginated
    ? `Retrieve a paginated list of ${resource}`
    : `Retrieve a specific ${resource} by ID`;

  const description = isPaginated
    ? getPaginationQueryParameterDescription(
        extraQueryParameters,
        hasActiveOrChangeStatusProperty,
        isActiveProperty,
      )
    : getByIdQueryParameterDescription(resource);

  return {
    summary: customSummary || summary,
    description: customDescription || description,
  };
};

const getPaginationQueryParameterDescription = (
  extraQueryParameters?: ExtraQueryParameterDto[],
  hasActiveOrChangeStatusProperty: boolean = true,
  isActiveProperty: boolean = true,
) => {
  const baseQueryParams = [
    '| skip      | number | The number of items to skip before starting to collect the result set. Useful for pagination. | Optional |',
    '| take      | number | The limit on the number of items to return. Useful for pagination. | Optional |',
    '| order     | string | Specifies the order of the results. **Case sensitive**. | Optional |',
    '| dlmgt     | string | Date Last Modified - Greater Than. Must be a valid ISO8601 date string (e.g., "2024-02-14T12:00:00Z"). | Optional |',
    '| dlmlt     | string | Date Last Modified - Less Than. Must be a valid ISO8601 date string (e.g., "2024-02-15T23:59:59Z"). | Optional |',
  ];

  if (hasActiveOrChangeStatusProperty) {
    const statusPropertyValue = isActiveProperty
      ? '| isActive  | string | Filters results by their active status. **Case sensitive**. | Optional |'
      : '| changeStatus | string | Filters results by their change status. **Case sensitive**. | Optional |';

    baseQueryParams.push(statusPropertyValue);
  }

  const extraParamsFormatted = extraQueryParameters
    ? extraQueryParameters
        .map(
          (param) =>
            `| ${param.name} | ${param.type} | ${param.description} | ${param.isRequired ? 'Required' : 'Optional'} |`,
        )
        .join('\n')
    : '';

  const finalQueryParams =
    baseQueryParams.join('\n') +
    (extraParamsFormatted ? `\n${extraParamsFormatted}` : '');

  return (
    '**Query Parameters:**\n\n' +
    '| Parameter | Type   | Description                                                  | Required |\n' +
    '|-----------|--------|--------------------------------------------------------------|----------|\n' +
    `${finalQueryParams}\n\n` +
    '**Notes:**\n' +
    '1. All query parameters are case sensitive.\n' +
    '2. If no pagination parameters (skip or take) are provided, default values will be applied.'
  );
};

const getByIdQueryParameterDescription = (resource: string) =>
  '**Path Parameter:**\n\n' +
  '| Parameter | Type   | Description                                                 | Required |\n' +
  '|-----------|--------|-------------------------------------------------------------|----------|\n' +
  `| id        | UUID   | The unique identifier (UUID) of the ${resource} to retrieve. | Required |\n\n`;

const pluralize = (word: string): string => {
  if (!word) return word;

  // Words ending with 'y' where the letter before 'y' is a consonant
  if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + 'ies';
  }

  // Words ending with 's', 'x', 'z', 'ch', or 'sh' take 'es'
  if (/s$|x$|z$|ch$|sh$/i.test(word)) {
    return word + 'es';
  }

  // Regular case: add 's'
  return word + 's';
};
