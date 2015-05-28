import ServiceResponse = require("./ServiceResponse");
import Item = require("../ServiceObjects/Items/Item");
import ExchangeService = require("../ExchangeService");
import JsonObject = require("../JsonObject");
import EwsServiceXmlReader = require("../EwsServiceXmlReader");
class UpdateItemResponse extends ServiceResponse {
    ReturnedItem: Item;
    ConflictCount: number;
    private item: Item;
    private returnedItem: Item;
    private conflictCount: number;
    GetObjectInstance(service: ExchangeService, xmlElementName: string): Item { throw new Error("UpdateItemResponse.ts - GetObjectInstance : Not implemented."); }
    Loaded(): any { throw new Error("UpdateItemResponse.ts - Loaded : Not implemented."); }
    ReadElementsFromJson(responseObject: JsonObject, service: ExchangeService): any { throw new Error("UpdateItemResponse.ts - ReadElementsFromJson : Not implemented."); }
    ReadElementsFromXmlJsObject(reader: EwsServiceXmlReader): any { throw new Error("UpdateItemResponse.ts - ReadElementsFromXmlJsObject : Not implemented."); }
}
export = UpdateItemResponse;
//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;
