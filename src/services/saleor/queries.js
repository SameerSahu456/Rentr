import { gql } from 'graphql-request'

// ─── Products ───

export const PRODUCTS_QUERY = gql`
  query Products(
    $first: Int!
    $after: String
    $channel: String!
    $filter: ProductFilterInput
    $sortBy: ProductOrder
  ) {
    products(
      first: $first
      after: $after
      channel: $channel
      filter: $filter
      sortBy: $sortBy
    ) {
      totalCount
      edges {
        node {
          id
          name
          slug
          description
          thumbnail(size: 400) {
            url
            alt
          }
          category {
            id
            name
            slug
          }
          pricing {
            priceRange {
              start {
                gross {
                  amount
                  currency
                }
              }
            }
          }
          metadata {
            key
            value
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

export const PRODUCT_BY_SLUG_QUERY = gql`
  query ProductBySlug($slug: String!, $channel: String!) {
    product(slug: $slug, channel: $channel) {
      id
      name
      slug
      description
      seoDescription
      category {
        id
        name
        slug
        parent {
          name
        }
      }
      media {
        url(size: 800)
        alt
        type
      }
      thumbnail(size: 400) {
        url
        alt
      }
      pricing {
        priceRange {
          start {
            gross {
              amount
              currency
            }
          }
        }
      }
      attributes {
        attribute {
          name
          slug
        }
        values {
          name
          value
        }
      }
      metadata {
        key
        value
      }
      variants {
        id
        name
        sku
        pricing {
          price {
            gross {
              amount
              currency
            }
          }
        }
      }
    }
  }
`

export const CATEGORIES_QUERY = gql`
  query Categories($first: Int!, $channel: String) {
    categories(first: $first, level: 0) {
      edges {
        node {
          id
          name
          slug
          children(first: 20) {
            edges {
              node {
                id
                name
                slug
              }
            }
          }
        }
      }
    }
  }
`

// ─── Auth ───

export const TOKEN_CREATE_MUTATION = gql`
  mutation TokenCreate($email: String!, $password: String!) {
    tokenCreate(email: $email, password: $password) {
      token
      refreshToken
      errors {
        field
        message
      }
      user {
        id
        email
        firstName
        lastName
        metadata {
          key
          value
        }
      }
    }
  }
`

export const TOKEN_REFRESH_MUTATION = gql`
  mutation TokenRefresh($refreshToken: String!) {
    tokenRefresh(refreshToken: $refreshToken) {
      token
      errors {
        field
        message
      }
    }
  }
`

export const ACCOUNT_REGISTER_MUTATION = gql`
  mutation AccountRegister($input: AccountRegisterInput!) {
    accountRegister(input: $input) {
      user {
        id
        email
        firstName
        lastName
        metadata {
          key
          value
        }
      }
      errors {
        field
        message
      }
    }
  }
`

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      metadata {
        key
        value
      }
      orders(first: 20) {
        edges {
          node {
            id
            number
            statusDisplay
            created
            total {
              gross {
                amount
                currency
              }
            }
            lines {
              id
              productName
              quantity
              totalPrice {
                gross {
                  amount
                  currency
                }
              }
            }
          }
        }
      }
    }
  }
`

// ─── Orders ───

export const MY_ORDERS_QUERY = gql`
  query MyOrders($first: Int!, $after: String) {
    me {
      orders(first: $first, after: $after) {
        totalCount
        edges {
          node {
            id
            number
            statusDisplay
            status
            created
            total {
              gross {
                amount
                currency
              }
            }
            lines {
              id
              productName
              productSku
              quantity
              unitPrice {
                gross {
                  amount
                  currency
                }
              }
              totalPrice {
                gross {
                  amount
                  currency
                }
              }
            }
            shippingAddress {
              firstName
              lastName
              streetAddress1
              city
              postalCode
              country {
                country
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`

// ─── Checkout / Promotions ───

export const CHECKOUT_ADD_PROMO_CODE = gql`
  mutation CheckoutAddPromoCode($id: ID!, $promoCode: String!) {
    checkoutAddPromoCode(id: $id, promoCode: $promoCode) {
      checkout {
        id
        discount {
          amount
          currency
        }
        totalPrice {
          gross {
            amount
            currency
          }
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`
