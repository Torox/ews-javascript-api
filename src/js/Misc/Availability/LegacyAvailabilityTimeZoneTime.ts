import ComplexProperty = require("../../ComplexProperties/ComplexProperty");
import DayOfTheWeek = require("../../Enumerations/DayOfTheWeek");
import ExchangeService = require("../../Core/ExchangeService");
import JsonObject = require("../../Core/JsonObject");
import EwsServiceXmlReader = require("../../Core/EwsServiceXmlReader");
import EwsServiceXmlWriter = require("../../Core/EwsServiceXmlWriter");

class LegacyAvailabilityTimeZoneTime extends ComplexProperty {
    HasTransitionTime: boolean;
    Delta: any /*System.TimeSpan*/;
    TimeOfDay: any /*System.TimeSpan*/;
    DayOrder: number;
    Month: number;
    DayOfTheWeek: DayOfTheWeek;
    Year: number;
    private delta: any /*System.TimeSpan*/;
    private year: number;
    private month: number;
    private dayOrder: number;
    private dayOfTheWeek: DayOfTheWeek;
    private timeOfDay: any /*System.TimeSpan*/;
    InternalToJson(service: ExchangeService): any { throw new Error("LegacyAvailabilityTimeZoneTime.ts - InternalToJson : Not implemented."); }
    LoadFromJson(jsonProperty: JsonObject, service: ExchangeService): any { throw new Error("LegacyAvailabilityTimeZoneTime.ts - LoadFromJson : Not implemented."); }
    ToTransitionTime(): any { throw new Error("LegacyAvailabilityTimeZoneTime.ts - ToTransitionTime : Not implemented."); }
    TryReadElementFromXmlJsObject(reader: EwsServiceXmlReader): boolean { throw new Error("LegacyAvailabilityTimeZoneTime.ts - TryReadElementFromXmlJsObject : Not implemented."); }
    WriteElementsToXml(writer: EwsServiceXmlWriter): any { throw new Error("LegacyAvailabilityTimeZoneTime.ts - WriteElementsToXml : Not implemented."); }
}
export = LegacyAvailabilityTimeZoneTime;
//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;
