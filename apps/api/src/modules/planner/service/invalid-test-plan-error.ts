export class InvalidTestPlanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTestPlanError";
  }
}
