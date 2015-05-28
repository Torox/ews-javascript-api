import WellKnownFolderName = require("../../../Enumerations/WellKnownFolderName");
import ExchangeVersion = require("../../../Enumerations/ExchangeVersion");

import ExchangeService = require("../../ExchangeService");
import Folder = require("./Folder");
class CalendarFolder extends Folder {
    constructor(service:ExchangeService){
        super(service);
    }
    ////////Bind(service: ExchangeService, id: FolderId, propertySet: PropertySet): CalendarFolder { throw new Error("CalendarFolder.ts - Bind : Not implemented."); }
    ////////Bind(service: ExchangeService, id: FolderId): CalendarFolder { throw new Error("CalendarFolder.ts - Bind : Not implemented."); }
    ////////Bind(service: ExchangeService, name: WellKnownFolderName, propertySet: PropertySet): CalendarFolder { throw new Error("CalendarFolder.ts - Bind : Not implemented."); }
    //////Bind(service: ExchangeService, name: WellKnownFolderName): CalendarFolder { throw new Error("CalendarFolder.ts - Bind : Not implemented."); }
    //////FindAppointments<TItem extends Item>(view: CalendarView): FindItemsResults<TItem> { throw new Error("CalendarFolder.ts - FindAppointments<TItem extends Item> : Not implemented."); }
    //////GetMinimumRequiredServerVersion(): ExchangeVersion { throw new Error("CalendarFolder.ts - GetMinimumRequiredServerVersion : Not implemented."); }
}
 export = CalendarFolder;




//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export
