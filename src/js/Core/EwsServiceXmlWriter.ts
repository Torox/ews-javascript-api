﻿import {Strings} from "../Strings";
import {EwsLogging} from "./EwsLogging";
import {ExchangeServiceBase} from "./ExchangeServiceBase";
import {EwsUtilities} from "./EwsUtilities";
import {XmlNamespace} from "../Enumerations/XmlNamespace";

import {StringHelper, base64Helper} from "../ExtensionMethods";
export class EwsServiceXmlWriter {
    //get InternalWriter(): System.Xml.XmlWriter;
    get Service(): ExchangeServiceBase { return this.service }
    static BufferSize: number = 4096;

    IsTimeZoneHeaderEmitted: boolean;
    RequireWSSecurityUtilityNamespace: boolean;
    private isDisposed: boolean;
    private service: ExchangeServiceBase;
    private xmlWriter: any;// System.Xml.XmlWriter;
    private isTimeZoneHeaderEmitted: boolean;
    private requireWSSecurityUtilityNamespace: boolean;
    private static utf8Encoding: any;// System.Text.Encoding;
    Dispose(): any { throw new Error("EwsServiceXmlWriter.ts - Dispose : Not implemented."); }
    Flush(): void { //throw new Error("Not implemented.");
    }

    //#region custome XML writer data;
    private xmlElements: string[] = [];
    private pendingElementData = "";
    private pendingXMLTagClosure = false;
    private soapData: string = "";

    private rootUris: string[] = [];
    private rootLevel: boolean = false;
    private currentLevel: number = 0;
    private uriCache: string[][];

    GetXML(keep: boolean = false): string {
        var returnVal = this.soapData.trim();
        if (!keep) this.soapData = "";
        return returnVal;
    }

    private CloseTag(): void {
        if (this.pendingXMLTagClosure) {
            this.soapData += ">";
            this.pendingXMLTagClosure = false;
            this.rootLevel = false;
        }

    }

    private PushUris(prefix: string, uri: string): void {

        if (this.rootLevel) {
            this.rootUris.push(prefix + ":" + uri);
        }

    }

    private CheckRootUri(prefix: string, uri: string): boolean {
        return this.rootUris.indexOf(prefix + ":" + uri) >= 0;
    }

    //#endregion
    
    constructor(service: ExchangeServiceBase) {
        this.service = service;
    }

    //TryConvertObjectToString(value: any, strValue: any): boolean { throw new Error("EwsServiceXmlWriter.ts - TryConvertObjectToString : Not implemented."); }
    ConvertObjectToString(value: any): string {
        var strValue: string = null;

        if (value === null) return null;
        if (typeof (value) == "object" && !(value.GetSearchString /*ISearchStringProvider*/)) throw new Error("value can not be of type object");

        if (value != null) {
            switch (typeof (value)) {
                case "boolean":
                    strValue = EwsUtilities.BoolToXSBool(<boolean>value);
                    break;
                case "number":
                    strValue = value;
                    //todo check for datetime
                    //strValue = this.Service.ConvertDateTimeToUniversalDateTimeString((DateTime) value);
                    break;
                case "string":
                    return value;
                default:
                    try {
                        if (typeof value.GetSearchString !== 'undefined') // checking - ISearchStringProvider
                            strValue = value.GetSearchString();
                    }
                    catch (e) {
                        strValue = value;
                    }

                    break;
            }
            return strValue;
        }

        //return converted;
        return undefined;
    }
    //WriteAttributeString(localName: string, stringValue: string): any { throw new Error("EwsServiceXmlWriter.ts - WriteAttributeString : Not implemented."); }

    WriteAttributeString(namespacePrefix: string, localName: string, stringValue: string, alwaysWriteEmptyString: boolean = false): void {
        var namespaceprefix = namespacePrefix || "";
        if (namespaceprefix !== "") namespaceprefix += ":";
        this.soapData += " " + namespaceprefix + localName + "=\"" + stringValue + "\"";
        if (namespacePrefix == "xmlns") // push to rootUris cache
            this.PushUris(localName, stringValue);
        //try {
        //    this.xmlWriter.WriteAttributeString(
        //        namespacePrefix,
        //        localName,
        //        null,
        //        stringValue);
        //}
        //catch (ex) {
        //    // XmlTextWriter will throw ArgumentException if string includes invalid characters.
        //    //throw new ServiceXmlSerializationException(
        //    //    string.Format(Strings.InvalidAttributeValue, stringValue, localName),
        //    //    ex);
        //}
    }
    //WriteAttributeValue(localName: string, value: any): any { throw new Error("EwsServiceXmlWriter.ts - WriteAttributeValue : Not implemented."); }
    //WriteAttributeValue(localName: string, alwaysWriteEmptyString: boolean, value: any): any { throw new Error("EwsServiceXmlWriter.ts - WriteAttributeValue : Not implemented."); }
    //WriteAttributeValue(namespacePrefix: string, localName: string, value: any): void {}
    WriteAttributeValue(namespacePrefix: string, localName: string, value: any, alwaysWriteEmptyString: boolean = false): void {
        var stringValue: string = this.ConvertObjectToString(value);
        if (!StringHelper.IsNullOrEmpty(stringValue) || alwaysWriteEmptyString) {
            this.WriteAttributeString(
                namespacePrefix,
                localName,
                stringValue);
        }
    }
    //WriteBase64ElementValue(buffer: System.Byte[]): any{ throw new Error("EwsServiceXmlWriter.ts - WriteBase64ElementValue : Not implemented.");}
    //WriteBase64ElementValue(stream: System.IO.Stream): any{ throw new Error("EwsServiceXmlWriter.ts - WriteBase64ElementValue : Not implemented.");}
    WriteBase64ElementValue(buffer: any): void {
        this.WriteValue(base64Helper.btoa(buffer), null);
    }
    WriteElementValue(xmlNamespace: XmlNamespace, localName: string, value: any, displayName: string = localName): void {
        var stringValue: string = this.ConvertObjectToString(value);
        if (stringValue != undefined) {
            this.WriteStartElement(xmlNamespace, localName);
            this.WriteValue(stringValue, displayName);
            this.WriteEndElement();
        }
        else {
            EwsLogging.Assert(stringValue !== 'undefined', 'WriteElementValue', StringHelper.Format(
                Strings.ElementValueCannotBeSerialized,
                typeof (value), localName));
                
            // throw new Error(StringHelper.Format(
            //     Strings.ElementValueCannotBeSerialized,
            //     typeof (value), localName));
        }
    }

    //WriteElementValue(xmlNamespace: XmlNamespace, localName: string, value: any): any{ throw new Error("EwsServiceXmlWriter.ts - WriteElementValue : Not implemented.");}

    WriteEndElement(): void {
        //this.xmlWriter.WriteEndElement();
        var element = "</" + this.xmlElements.pop() + ">";
        this.CloseTag();
        this.soapData += element;
    }
    //WriteNode(xmlNode: System.Xml.XmlNode): any{ throw new Error("EwsServiceXmlWriter.ts - WriteNode : Not implemented.");}
    WriteStartElement(xmlNamespace: XmlNamespace, localName: string): void {
        this.CloseTag();
        if (this.soapData == "")
            this.rootLevel = true;
        else
            this.soapData += "";//\r\n";
        var prefix = EwsUtilities.GetNamespacePrefix(xmlNamespace);
        this.soapData += "<" + prefix + ":" + localName;

        var uri = EwsUtilities.GetNamespaceUri(xmlNamespace);
        if (!this.CheckRootUri(prefix, uri)) {
            this.soapData += " xmlns:" + prefix + "=\"" + uri + "\"";
        }
        this.PushUris(prefix, uri);

        this.xmlElements.push(prefix + ":" + localName);

        this.pendingXMLTagClosure = true;
        //this.xmlWriter.WriteStartElement(
        //    EwsUtilities.GetNamespacePrefix(xmlNamespace),
        //    localName,
        //    EwsUtilities.GetNamespaceUri(xmlNamespace));
    }
    WriteValue(value: string, name: string): any {
        //var closeElement = this.soapData.charAt(this.soapData.length - 1) !== ">";
        //if (closeElement) this.soapData += ">";
        this.CloseTag();
        this.soapData += value;

        //todo: validate invalid characters
        // name is used for exception with invalid characters
    }
}