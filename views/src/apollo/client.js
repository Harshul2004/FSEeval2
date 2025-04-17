import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include',
  fetchOptions: {
    mode: 'cors',
  }
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  console.log('Setting up GraphQL request');
  console.log('Token:', token ? 'Present' : 'Not present');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Operation: ${operation.operationName}`
      );
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    console.error('Network error details:', {
      name: networkError.name,
      message: networkError.message,
      stack: networkError.stack,
      statusCode: networkError.statusCode
    });
  }
});

const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
  connectToDevTools: true
});

export default client;