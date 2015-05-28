import DateTimePropertyDefinition = require("./DateTimePropertyDefinition");
import ExchangeVersion = require("../Enumerations/ExchangeVersion");
import PropertyDefinition = require("./PropertyDefinition");
import ExchangeServiceBase = require("../Core/ExchangeServiceBase");
import PropertyBag = require("../Core/PropertyBag");
class ScopedDateTimePropertyDefinition extends DateTimePropertyDefinition {
    private getPropertyDefinitionCallback: GetPropertyDefinitionCallback;
    GetTimeZoneProperty(version: ExchangeVersion): PropertyDefinition { throw new Error("ScopedDateTimePropertyDefinition.ts - GetTimeZoneProperty : Not implemented."); }
    ScopeToTimeZone(service: ExchangeServiceBase, dateTime: Date, propertyBag: PropertyBag, isUpdateOperation: boolean): Date { throw new Error("ScopedDateTimePropertyDefinition.ts - ScopeToTimeZone : Not implemented."); }
}

interface GetPropertyDefinitionCallback {
    (version: ExchangeVersion): PropertyDefinition
}

export = ScopedDateTimePropertyDefinition;
//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;
