import {run} from "ar-gql";
import Arweave from "arweave";

const VERSION = "0.005";

const client = new Arweave({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

interface LimestoneResult {
  updated?: Date
  price?: number
}

type Token = "AR" | "ETH"

interface LimestoneInput {
  type: "data-latest" | "data-configuration"
  token: Token
}

const findGraphQL = async (parameters: LimestoneInput): Promise<LimestoneResult> => {
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
        (await client.network.getInfo()).height - 50
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

    let price = undefined, updated = undefined;

    tags.forEach((tag) => {
      if (tag.name === "value") {
        price = parseFloat(tag.value);
      }
      if (tag.name === "time") {
        updated = new Date(parseInt(tag.value));
      }
    });

    return {
      price: price,
      updated: updated
    };

  } else {
    throw new Error("Invalid data returned from Arweave.");
  }
}


export const getPrice = async (token: Token) => {
  return await findGraphQL({
    type: "data-latest",
    token,
  });
}