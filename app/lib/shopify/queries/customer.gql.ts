// app/lib/shopify/queries/customer.gql.ts

export const CUSTOMER_CREATE_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`;

export const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`;

export const CUSTOMER_BY_TOKEN_QUERY = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
      phone
      defaultAddress {
        address1
        city
        country
        zip
      }
    }
  }
`;

export const CUSTOMER_RECOVER_MUTATION = /* GraphQL */ `
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`;
