import { initContract } from "@ts-rest/core";
import { HealthContract } from "./health/health.contract";
import { TranslateContract } from "./translate/translate.contract";

const c = initContract();

export const ApiContract = c.router({
  "Health": HealthContract,
  "Translate": TranslateContract,
});
