class TechnicalError {
  constructor(status, code, title = "Internal Server Error", details) {
    this.status = status.toString();
    this.code = code;
    this.title = title;
    this.detail = details;
    this.source = null;
  }

  setDetail(detail) {
    this.detail = detail;
    return this;
  }

  setSource(pointer) {
    if (pointer) {
      this.source = {
        pointer: pointer
      };
    }
    return this;
  }
}

module.exports = TechnicalError;
