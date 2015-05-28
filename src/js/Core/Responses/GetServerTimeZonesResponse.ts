import ServiceResponse = require("./ServiceResponse");
import EwsServiceXmlReader = require("../EwsServiceXmlReader");
class GetServerTimeZonesResponse extends ServiceResponse {
    TimeZones: any[];// System.Collections.ObjectModel.Collection<System.TimeZoneInfo>;
    private timeZones: any[];//System.Collections.ObjectModel.Collection<System.TimeZoneInfo>;
    ReadElementsFromXmlJsObject(reader: EwsServiceXmlReader): any { throw new Error("GetServerTimeZonesResponse.ts - ReadElementsFromXmlJsObject : Not implemented."); }
}
export = GetServerTimeZonesResponse;
//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;
