import Item = require("../ServiceObjects/Items/Item");
import ServiceResponse = require("../Responses/ServiceResponse");
import MoveCopyRequest = require("./MoveCopyRequest");
import ItemIdWrapperList = require("../../Misc/ItemIdWrapperList");
import JsonObject = require("../JsonObject");
import ExchangeService = require("../ExchangeService");
import EwsServiceXmlWriter = require("../EwsServiceXmlWriter");
class MoveCopyItemRequest<TResponse extends ServiceResponse> extends MoveCopyRequest<Item, TResponse> {
    ItemIds: ItemIdWrapperList;
    ReturnNewItemIds: boolean;
    private itemIds: ItemIdWrapperList;
    AddIdsToJson(jsonObject: JsonObject, service: ExchangeService): any { throw new Error("Not implemented."); }
    GetExpectedResponseMessageCount(): number { throw new Error("Not implemented."); }
    Validate(): any { throw new Error("Not implemented."); }
    WriteIdsToXml(writer: EwsServiceXmlWriter): any { throw new Error("Not implemented."); }
}
export = MoveCopyItemRequest;
//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;
