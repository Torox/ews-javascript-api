import AttachmentCollection = require("../ComplexProperties/AttachmentCollection");
import ComplexPropertyDefinition = require("./ComplexPropertyDefinition");
import PropertyDefinitionFlags = require("../Enumerations/PropertyDefinitionFlags");
import ExchangeVersion = require("../Enumerations/ExchangeVersion");

class AttachmentsPropertyDefinition extends ComplexPropertyDefinition<AttachmentCollection> {
    private static Exchange2010SP2PropertyDefinitionFlags: PropertyDefinitionFlags;
    HasFlag(flag: PropertyDefinitionFlags, version: ExchangeVersion): boolean { throw new Error("Not implemented."); }
}
export = AttachmentsPropertyDefinition;
//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;

