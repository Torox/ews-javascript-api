import FreeBusyViewType = require("../../Enumerations/FreeBusyViewType");
import SuggestionQuality = require("../../Enumerations/SuggestionQuality");
import TimeWindow = require("./TimeWindow");
import EwsServiceXmlWriter = require("../../Core/EwsServiceXmlWriter");
import GetUserAvailabilityRequest = require("../../Core/Requests/GetUserAvailabilityRequest");
class AvailabilityOptions {
    MergedFreeBusyInterval: number;
    RequestedFreeBusyView: FreeBusyViewType;
    GoodSuggestionThreshold: number;
    MaximumSuggestionsPerDay: number;
    MaximumNonWorkHoursSuggestionsPerDay: number;
    MeetingDuration: number;
    MinimumSuggestionQuality: SuggestionQuality;
    DetailedSuggestionsWindow: TimeWindow;
    CurrentMeetingTime: Date;
    GlobalObjectId: string;
    private mergedFreeBusyInterval: number;
    private requestedFreeBusyView: FreeBusyViewType;
    private goodSuggestionThreshold: number;
    private maximumSuggestionsPerDay: number;
    private maximumNonWorkHoursSuggestionsPerDay: number;
    private meetingDuration: number;
    private minimumSuggestionQuality: SuggestionQuality;
    private detailedSuggestionsWindow: TimeWindow;
    private currentMeetingTime: Date;
    private globalObjectId: string;
    Validate(timeWindow: any /*System.TimeSpan*/): any { throw new Error("AvailabilityOptions.ts - Validate : Not implemented."); }
    WriteToXml(writer: EwsServiceXmlWriter, request: GetUserAvailabilityRequest): any { throw new Error("AvailabilityOptions.ts - WriteToXml : Not implemented."); }
}
export = AvailabilityOptions;

//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;
