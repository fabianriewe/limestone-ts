import { getPrice } from "./limestone";

describe("Limestone", function () {
  it("Should get the latest price", (done) => {
    getPrice("AR").then((result) => {
      console.log(result);
      done();
    });
  });
});
