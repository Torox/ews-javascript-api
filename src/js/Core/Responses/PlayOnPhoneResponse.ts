import ServiceResponse = require("./ServiceResponse");
import PhoneCallId = require("../../UnifiedMessaging/PhoneCallId");
import JsonObject = require("../JsonObject");
import ExchangeService = require("../ExchangeService");
import EwsServiceXmlReader = require("../EwsServiceXmlReader");
class PlayOnPhoneResponse extends ServiceResponse {
    PhoneCallId: PhoneCallId;
    private phoneCallId: PhoneCallId;
    ReadElementsFromJson(responseObject: JsonObject, service: ExchangeService): any { throw new Error("PlayOnPhoneResponse.ts - ReadElementsFromJson : Not implemented."); }
    ReadElementsFromXmlJsObject(reader: EwsServiceXmlReader): any { throw new Error("PlayOnPhoneResponse.ts - ReadElementsFromXmlJsObject : Not implemented."); }
}
export = PlayOnPhoneResponse;
//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;

