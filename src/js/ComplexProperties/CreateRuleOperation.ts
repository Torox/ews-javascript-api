import RuleOperation = require("./RuleOperation");
import Rule = require("./Rule");
import ExchangeService = require("../Core/ExchangeService");
import EwsServiceXmlWriter = require("../Core/EwsServiceXmlWriter");

class CreateRuleOperation extends RuleOperation {
    Rule: Rule;
    XmlElementName: string;
    private rule: Rule;
    InternalToJson(service: ExchangeService): any { throw new Error("Not implemented."); }
    InternalValidate(): any { throw new Error("Not implemented."); }
    WriteElementsToXml(writer: EwsServiceXmlWriter): any { throw new Error("Not implemented."); }
}
export = CreateRuleOperation;
//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;
