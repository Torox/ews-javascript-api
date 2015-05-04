import ItemId = require("./ItemId");
import ComplexPropertyCollection = require("./ComplexPropertyCollection");

class ItemIdCollection extends ComplexPropertyCollection<ItemId> {
    CreateComplexProperty(xmlElementName: string): ItemId { throw new Error("Not implemented."); }
    CreateDefaultComplexProperty(): ItemId { throw new Error("Not implemented."); }
    GetCollectionItemXmlElementName(complexProperty: ItemId): string { throw new Error("Not implemented."); }
}
export = ItemIdCollection;
//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;
