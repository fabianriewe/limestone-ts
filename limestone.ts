import {run} from "ar-gql";
import Arweave from "arweave";

const VERSION = "0.005";

const client = Arweave({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

interface LimestoneResult {
  updated: Date
  price: number
}

type Token = "AR" | "ETH"

interface LimestoneInput {
  type: "data-latest" | "data-configuration"
  token: Token
}

const findGraphQL = async (parameters: LimestoneInput) => {
  const res = (
    await run(
      `
    {
      transactions(
        tags: [
          { name: "app", values: "Limestone" }
          { name: "type", values: "${parameters.type}" }
          { name: "token", values: "${parameters.token}" }
          { name: "version", values: "${VERSION}" }
        ]
        block: { min: ${
        parseInt((await client.network.getInfo()).height) - 50
      } }
        first: 1
      ) {
        edges {
          node {
            tags {
              name
              value
            }
          }
        }
      }
    }
    `
    )
  ).data.transactions.edges;

  if (res[0]) {

    const tags = res[0].node.tags;

    let result: LimestoneResult;

    tags.forEach((tag) => {
      if (tag.name === "value") {
        result.price = parseFloat(tag.value);
      }
      if (tag.name === "time") {
        result.updated = new Date(parseInt(tag.value));
      }
    });

    return result;
  } else {
    throw new Error("Invalid data returned from Arweave.");
  }
}


export const getPrice = async (token: Token) => {
  if (typeof token !== "string")
    throw new TypeError("Please provide a token symbol as string.");

  return await findGraphQL({
    type: "data-latest",
    token,
  });
}