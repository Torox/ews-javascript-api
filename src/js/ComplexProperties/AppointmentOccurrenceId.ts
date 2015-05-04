import ItemId = require("./ItemId");
import ExchangeService = require("../Core/ExchangeService");
import EwsServiceXmlWriter = require("../Core/EwsServiceXmlWriter");

class AppointmentOccurrenceId extends ItemId {
    OccurrenceIndex: number;
    private occurrenceIndex: number;
    GetXmlElementName(): string { throw new Error("Not implemented."); }
    InternalToJson(service: ExchangeService): any { throw new Error("Not implemented."); }
    WriteAttributesToXml(writer: EwsServiceXmlWriter): any { throw new Error("Not implemented."); }
}
export = AppointmentOccurrenceId;
//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;
