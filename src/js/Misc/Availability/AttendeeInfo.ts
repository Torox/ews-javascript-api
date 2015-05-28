import MeetingAttendeeType = require("../../Enumerations/MeetingAttendeeType");
import EwsServiceXmlWriter = require("../../Core/EwsServiceXmlWriter");
class AttendeeInfo {
    SmtpAddress: string;
    AttendeeType: MeetingAttendeeType;
    ExcludeConflicts: boolean;
    private smtpAddress: string;
    private attendeeType: MeetingAttendeeType;
    private excludeConflicts: boolean;
    WriteToXml(writer: EwsServiceXmlWriter): any { throw new Error("AttendeeInfo.ts - WriteToXml : Not implemented."); }
}
export = AttendeeInfo;

//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;
