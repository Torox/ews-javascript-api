import Strings = require("../Strings");
import OAuthCredentials = require("../Credentials/OAuthCredentials");
import X509CertificateCredentials = require("../Credentials/X509CertificateCredentials");
import PartnerTokenCredentials = require("../Credentials/PartnerTokenCredentials");
import WindowsLiveCredentials = require("../Credentials/WindowsLiveCredentials");
import ExchangeVersion = require("../Enumerations/ExchangeVersion");//enum
import ExchangeServiceBase = require("../Core/ExchangeServiceBase");
import EwsUtilities = require("../Core/EwsUtilities");
import UserSettingName = require("../Enumerations/UserSettingName");
import DomainSettingName = require("../Enumerations/DomainSettingName");
import AutodiscoverEndpoints = require("../Enumerations/AutodiscoverEndpoints");
import TraceFlags = require("../Enumerations/TraceFlags");
import AutodiscoverErrorCode = require("../Enumerations/AutodiscoverErrorCode");
import AutodiscoverRequest = require("./Requests/AutodiscoverRequest");
import GetDomainSettingsRequest = require("./Requests/GetDomainSettingsRequest");
import GetDomainSettingsResponse = require("./Responses/GetDomainSettingsResponse");
import GetUserSettingsResponse = require("./Responses/GetUserSettingsResponse");
import GetUserSettingsRequest = require("./Requests/GetUserSettingsRequest");
//import WindowsLiveCredentials = require("../Credentials/WindowsLiveCredentials");

import AutodiscoverLocalException = require("../Exceptions/AutodiscoverLocalException");
import ServiceVersionException = require("../Exceptions/ServiceVersionException");
import ServiceValidationException = require("../Exceptions/ServiceValidationException");

import GetUserSettingsResponseCollection = require("./Responses/GetUserSettingsResponseCollection");

import IOutParam = require("../Interfaces/IOutParam");
import IRefParam = require("../Interfaces/IRefParam");

import AutodiscoverServiceDelegates = require("./AutodiscoverServiceDelegates");
import AutodiscoverRedirectionUrlValidationCallback = AutodiscoverServiceDelegates.AutodiscoverRedirectionUrlValidationCallback;
import {StringHelper,EnumHelper,UriHelper} from "../ExtensionMethods";



import {IPromise, IXHROptions} from "../Interfaces";
import {Promise} from "../PromiseFactory"
import {XHR} from "../XHRFactory"

class AutodiscoverService extends ExchangeServiceBase {
    get Domain(): string {
        return this.domain;
    }
    set Domain(value) {
        this.domain = value;
        if (value)
            this.url = undefined;
    }
    get Url(): string { //System.Uri;
        return this.url;
    }
    set Url(value) {
        this.url = value;
        if (value)
            this.domain = UriHelper.getDomain(value);
    }
    IsExternal: boolean;
    RedirectionUrlValidationCallback: AutodiscoverRedirectionUrlValidationCallback;
    DnsServerAddress: any;// System.Net.IPAddress;
    EnableScpLookup: boolean;
    GetScpUrlsForDomainCallback: Function;// System.Func<string, System.Collections.Generic.ICollection<string>>;
    private domain: string;
    private url: string;//System.Uri;
    private static LegacyPathRegex: any;
    //private isExternal: boolean;
    //private redirectionUrlValidationCallback: AutodiscoverRedirectionUrlValidationCallback;
    //private dnsClient: AutodiscoverDnsClient;
    //private dnsServerAddress: any;// System.Net.IPAddress;
    //private enableScpLookup: boolean;


    private static AutodiscoverLegacyPath: string = "/autodiscover/autodiscover.xml";
    private static AutodiscoverLegacyUrl: string = "{0}://{1}" + AutodiscoverService.AutodiscoverLegacyPath;
    private static AutodiscoverLegacyHttpsUrl: string = "https://{0}" + AutodiscoverService.AutodiscoverLegacyPath;
    private static AutodiscoverLegacyHttpUrl: string = "http://{0}" + AutodiscoverService.AutodiscoverLegacyPath;
    private static AutodiscoverSoapHttpsUrl: string = "https://{0}/autodiscover/autodiscover.svc";
    private static AutodiscoverSoapWsSecurityHttpsUrl: string = AutodiscoverService.AutodiscoverSoapHttpsUrl + "/wssecurity";
    private static AutodiscoverSoapWsSecuritySymmetricKeyHttpsUrl: string = AutodiscoverService.AutodiscoverSoapHttpsUrl + "/wssecurity/symmetrickey";
    private static AutodiscoverSoapWsSecurityX509CertHttpsUrl: string = AutodiscoverService.AutodiscoverSoapHttpsUrl + "/wssecurity/x509cert";
    private static AutodiscoverRequestNamespace: string = "http://schemas.microsoft.com/exchange/autodiscover/outlook/requestschema/2006";
    static AutodiscoverMaxRedirections: number = 10;
    private static AutodiscoverSoapEnabledHeaderName: string = "X-SOAP-Enabled";
    private static AutodiscoverWsSecurityEnabledHeaderName: string = "X-WSSecurity-Enabled";
    private static AutodiscoverWsSecuritySymmetricKeyEnabledHeaderName: string = "X-WSSecurity-SymmetricKey-Enabled";
    private static AutodiscoverWsSecurityX509CertEnabledHeaderName: string = "X-WSSecurity-X509Cert-Enabled";
    private static AutodiscoverOAuthEnabledHeaderName: string = "X-OAuth-Enabled";
    private static MinimumRequestVersionForAutoDiscoverSoapService: ExchangeVersion = ExchangeVersion.Exchange2010;


    constructor(
        url?: string,
        domain?: string,
        requestedServerVersion: ExchangeVersion = ExchangeVersion.Exchange2010) {
        super(requestedServerVersion);

        EwsUtilities.ValidateDomainNameAllowNull(domain, "domain");

        this.url = url;
        this.domain = domain;
    }


    CallRedirectionUrlValidationCallback(redirectionUrl: string): boolean {
        var callback: AutodiscoverRedirectionUrlValidationCallback = (this.RedirectionUrlValidationCallback == null)
            ? this.DefaultAutodiscoverRedirectionUrlValidationCallback
            : this.RedirectionUrlValidationCallback;

        return callback(redirectionUrl);
    }
    DefaultAutodiscoverRedirectionUrlValidationCallback(redirectionUrl: string): boolean {
        throw new AutodiscoverLocalException(StringHelper.Format("Autodiscover redirection is blocked for url: {0}"/*Strings.AutodiscoverRedirectBlocked*/, redirectionUrl));
    }
    //DefaultGetScpUrlsForDomain(domainName: string): string[] { return null; }// System.Collections.Generic.ICollection<string>{ throw new Error("AutodiscoverService.ts - DefaultGetScpUrlsForDomain : Not implemented.");}
    //DisableScpLookupIfDuplicateRedirection(emailAddress: string, redirectionEmailAddresses: string[]): any{ throw new Error("AutodiscoverService.ts - DisableScpLookupIfDuplicateRedirection : Not implemented.");}
    GetAutodiscoverEndpointUrl(host: string): IPromise<string> {//System.Uri{
        var autodiscoverUrlOut: IOutParam<string> = { outValue: null };

        return this.TryGetAutodiscoverEndpointUrl(host, autodiscoverUrlOut).then((value) => {
            if (value) {
                return autodiscoverUrlOut.outValue;
            }
            else {
                throw new AutodiscoverLocalException("no soap or WsSecurity endpoint available"/*Strings.NoSoapOrWsSecurityEndpointAvailable*/);
            }
        },(err) => {
                throw new AutodiscoverLocalException("no soap or WsSecurity endpoint available"/*Strings.NoSoapOrWsSecurityEndpointAvailable*/);
            });
    }

    //--done
    GetAutodiscoverServiceHosts(domainName: string): string[] {

        var serviceHosts: string[] = [];
        var urls = this.GetAutodiscoverServiceUrls(domainName);
        for (var url of urls) {
            serviceHosts.push(UriHelper.getHost(url));
        }

        return serviceHosts;
    }
    //--done
    GetAutodiscoverServiceUrls(domainName: string): string[] {// System.Collections.Generic.List<T>{
        var urls: string[]=[];

        if (this.EnableScpLookup) {
            // Get SCP URLs
            //Func < string, ICollection <string>> callback = this.GetScpUrlsForDomainCallback ?? this.DefaultGetScpUrlsForDomain;
            //ICollection < string> scpUrls = callback(domainName);
            //foreach(string str in scpUrls)
            //{
            //    urls.Add(new Uri(str));
            //}
        }
        //scpHostCount = urls.length;

        // As a fallback, add autodiscover URLs base on the domain name.
        urls.push(StringHelper.Format(AutodiscoverService.AutodiscoverLegacyHttpsUrl, "autodiscover." + domainName));
        urls.push(StringHelper.Format(AutodiscoverService.AutodiscoverLegacyHttpsUrl, domainName));

        return urls;
    }
    //GetDomainSettings(domains: System.Collections.Generic.List<string>, settings: System.Collections.Generic.List<DomainSettingName>, requestedVersion: Data.ExchangeVersion): GetDomainSettingsResponseCollection{ throw new Error("AutodiscoverService.ts - GetDomainSettings : Not implemented.");}
    //GetDomainSettings(domains: System.Collections.Generic.IEnumerable<string>, requestedVersion: Data.ExchangeVersion, domainSettingNames: any): GetDomainSettingsResponseCollection{ throw new Error("AutodiscoverService.ts - GetDomainSettings : Not implemented.");}
    //GetDomainSettings(domain: string, requestedVersion: Data.ExchangeVersion, domainSettingNames: DomainSettingName[]): GetDomainSettingsResponse{
    GetDomainSettings(domain: string, domainSettingNames: DomainSettingName[]): IPromise<GetDomainSettingsResponse> {
        var request = new GetDomainSettingsRequest(this, this.url);
        request.Settings = domainSettingNames;
        request.Domains = [domain];
        var response = request.Execute();
        return <any>response;
    }

    //previous name - GetEndpointsFromHttpWebResponse
    GetEndpointsFromHttpResponse(response: XMLHttpRequest): AutodiscoverEndpoints {
        var endpoints: AutodiscoverEndpoints = AutodiscoverEndpoints.Legacy;
        if (!StringHelper.IsNullOrEmpty(response.getResponseHeader(AutodiscoverService.AutodiscoverSoapEnabledHeaderName))) {
            endpoints |= AutodiscoverEndpoints.Soap;
        }
        if (!StringHelper.IsNullOrEmpty(response.getResponseHeader(AutodiscoverService.AutodiscoverWsSecurityEnabledHeaderName))) {
            endpoints |= AutodiscoverEndpoints.WsSecurity;
        }
        if (!StringHelper.IsNullOrEmpty(response.getResponseHeader(AutodiscoverService.AutodiscoverWsSecuritySymmetricKeyEnabledHeaderName))) {
            endpoints |= AutodiscoverEndpoints.WSSecuritySymmetricKey;
        }
        if (!StringHelper.IsNullOrEmpty(response.getResponseHeader(AutodiscoverService.AutodiscoverWsSecurityX509CertEnabledHeaderName))) {
            endpoints |= AutodiscoverEndpoints.WSSecurityX509Cert;
        }
        if (!StringHelper.IsNullOrEmpty(response.getResponseHeader(AutodiscoverService.AutodiscoverOAuthEnabledHeaderName))) {
            endpoints |= AutodiscoverEndpoints.OAuth;
        }
        return endpoints;
    }
    //GetLegacyUserSettings(emailAddress: string): any{ throw new Error("AutodiscoverService.ts - GetLegacyUserSettings : Not implemented.");}
    //GetLegacyUserSettingsAtUrl(emailAddress: string, url: System.Uri): any{ throw new Error("AutodiscoverService.ts - GetLegacyUserSettingsAtUrl : Not implemented.");}
    //GetRedirectionUrlFromDnsSrvRecord(domainName: string): System.Uri{ throw new Error("AutodiscoverService.ts - GetRedirectionUrlFromDnsSrvRecord : Not implemented.");}
    GetRedirectUrl(domainName: string): IPromise<string> /*System.Uri*/ {
        var url: string = StringHelper.Format(AutodiscoverService.AutodiscoverLegacyHttpUrl, "autodiscover." + domainName);

        this.TraceMessage(
            TraceFlags.AutodiscoverConfiguration,
            StringHelper.Format("Trying to get Autodiscover redirection URL from {0}.", url));

        var xhrOptions: IXHROptions = {
            type: "GET",
            url: url,
        };
        return XHR(xhrOptions)
            .then((response: XMLHttpRequest) => {
            if (response != null) {

                this.TraceMessage(TraceFlags.All,
                    "***hard checking for office 365 with node.js http request and presence of header x-federationtrusttokenissueruri= urn:federation:MicrosoftOnline");

                var redirectUrl: string = null;
                if (!StringHelper.IsNullOrEmpty(response.getResponseHeader("x-federationtrusttokenissueruri"))) {
                    if (response.getResponseHeader("x-federationtrusttokenissueruri") === "urn:federation:MicrosoftOnline")
                        redirectUrl = "https://autodiscover-s.outlook.com/autodiscover/autodiscover.svc";
                    return redirectUrl;
                }
                //if (this.TryGetRedirectionResponse(response, redirectUrl)) {
                //    return redirectUrl;
                //}
            }

            this.TraceMessage(
                TraceFlags.AutodiscoverConfiguration,
                "No Autodiscover redirection URL was returned.");

            return null;

        },(resperr: XMLHttpRequest) => {
                if (resperr.status === 0) {
                    //catch (IOException ex)
                    this.TraceMessage(
                        TraceFlags.AutodiscoverConfiguration,
                        StringHelper.Format("I/O error: {0}", "unable to connect"));
                } else {
                    //catch (WebException ex)
                    this.TraceMessage(
                        TraceFlags.AutodiscoverConfiguration,
                        StringHelper.Format("--Request error: {0}, {1}", resperr.status, resperr.statusText));

                    //todo: possible?
                    // The exception response factory requires a valid HttpWebResponse,
                    // but there will be no web response if the web request couldn't be
                    // actually be issued (e.g. due to DNS error).
                    //if (ex.Response != null) {
                    //    response = this.HttpWebRequestFactory.CreateExceptionResponse(ex);
                    //}
                    }
                if (resperr.status === 401) {//unauthorized in case it was redirected, checking header now
                    this.TraceMessage(TraceFlags.All,
                        "***hard checking for office 365 with node.js http request and presence of header x-federationtrusttokenissueruri= urn:federation:MicrosoftOnline");

                    var redirectUrl: string = null;
                    if (!StringHelper.IsNullOrEmpty(resperr.getResponseHeader("x-federationtrusttokenissueruri"))) {
                        if (resperr.getResponseHeader("x-federationtrusttokenissueruri") === "urn:federation:MicrosoftOnline") {
                            redirectUrl = "https://autodiscover-s.outlook.com/autodiscover/autodiscover.svc";
                            this.TraceMessage(TraceFlags.All,
                                "possible hard match for O365 based on federation header (could be any legitimate 302 redirect - less likely)\r\n trying to connect to O365 multitenent autodiscover url: " + redirectUrl);
                        }
                        return redirectUrl;
                    }
                }
                return null;
            });
    }
    GetSettings<TGetSettingsResponseCollection, TSettingName>(
        identities: string[], settings: TSettingName[], requestedVersion: ExchangeVersion,
        getSettingsMethod: GetSettingsMethod<TGetSettingsResponseCollection, TSettingName>,
        getDomainMethod: () => string): IPromise<TGetSettingsResponseCollection> {
        // Autodiscover service only exists in E14 or later.
        if (this.RequestedServerVersion < AutodiscoverService.MinimumRequestVersionForAutoDiscoverSoapService) {
            throw new ServiceVersionException(
                StringHelper.Format(
                Strings.AutodiscoverServiceIncompatibleWithRequestVersion,
                    AutodiscoverService.MinimumRequestVersionForAutoDiscoverSoapService));
        }

        var response: IPromise<TGetSettingsResponseCollection> = null;
        var autodiscoverUrlRef: IRefParam<string> = { refvalue: this.Url };

        // If Url is specified, call service directly.
        if (this.Url != null) {

            return getSettingsMethod(
                identities,
                settings,
                requestedVersion,
                autodiscoverUrlRef, this).then((response) => {
                this.Url = autodiscoverUrlRef.refvalue;
                return response;
            });
        }

        // If Domain is specified, determine endpoint Url and call service.
        else if (!StringHelper.IsNullOrEmpty(this.Domain)) {
            return this.GetAutodiscoverEndpointUrl(this.Domain).then((adsvcurl) => {
                autodiscoverUrlRef = { refvalue: adsvcurl };
                return getSettingsMethod(
                    identities,
                    settings,
                    requestedVersion,
                    autodiscoverUrlRef, this).then((response) => {
                    // If we got this far, response was successful, set Url.
                    this.Url = autodiscoverUrlRef.refvalue;
                    return response;
                });
            },(err) => {
                    //throw err;
                });
        }

        // No Url or Domain specified, need to figure out which endpoint(s) to try.
        else {
            // Assume caller is not inside the Intranet, regardless of whether SCP Urls
            // were returned or not. SCP Urls are only relevent if one of them returns
            // valid Autodiscover settings.

            this.IsExternal = true;

            var autodiscoverOutUrl: IOutParam<string> = { outValue: undefined };

            var domainName: string = getDomainMethod();

            var scpHostCount: number;
            var hosts = this.GetAutodiscoverServiceHosts(domainName);//, scpHostCount);

            if (hosts.length == 0) {
                throw new ServiceValidationException("autodiscover service request requires domain or url"
                    /*Strings.AutodiscoverServiceRequestRequiresDomainOrUrl*/);
            }



            return this.GetSettingsRecursiveLookup(identities, settings, requestedVersion, getSettingsMethod, autodiscoverUrlRef, hosts).then((response) => {
                return response;
            },(err) => {

                    this.TraceMessage(TraceFlags.DebugMessage,
                        "--hard checking for office 365 with node.js http request and presence of header x-federationtrusttokenissueruri: urn:federation:MicrosoftOnline. All other redirection wil fail");
                    // Next-to-last chance: try unauthenticated GET over HTTP to be redirected to appropriate service endpoint.
                    return this.GetRedirectUrl(domainName).then((autodiscoverUrl) => {
                        if ((autodiscoverUrl != null) &&
                            this.CallRedirectionUrlValidationCallback(autodiscoverUrl.toString())) {
                            return this.TryGetAutodiscoverEndpointUrl(UriHelper.getHost(autodiscoverUrl), { outValue: autodiscoverUrl }).then((value) => {
                                if (value) {
                                    return getSettingsMethod(
                                        identities,
                                        settings,
                                        requestedVersion,
                                        { refvalue: autodiscoverUrl },this).then((response) => {
                                        // If we got this far, response was successful, set Url.
                                        this.Url = autodiscoverUrl;
                                        return response;
                                    });
                                }
                            });
                        }
                    },(err) => {
                            throw new AutodiscoverLocalException("Autodiscover could not be located, skipped srv record lookup, not implement in this js version"/*Strings.AutodiscoverCouldNotBeLocated*/);
                        });
                });




            /// ------- SRV record resolution not implemented ------- /// Last Chance: try to read autodiscover SRV Record from DNS. If we find one, use
            ////// the hostname returned to construct an Autodiscover endpoint URL.
            ////autodiscoverUrl = this.GetRedirectionUrlFromDnsSrvRecord(domainName);
            ////if ((autodiscoverUrl != null) &&
            ////    this.CallRedirectionUrlValidationCallback(autodiscoverUrl.ToString()) &&
            ////    this.TryGetAutodiscoverEndpointUrl(autodiscoverUrl.Host, out autodiscoverUrl)) {
            ////    response = getSettingsMethod(
            ////        identities,
            ////        settings,
            ////        requestedVersion,
            ////        ref autodiscoverUrl);

            ////    // If we got this far, the response was successful, set Url.
            ////    this.Url = autodiscoverUrl;

            ////    return response;
            ////}
            ////else {
            ////    throw new AutodiscoverLocalException(Strings.AutodiscoverCouldNotBeLocated);
            ////}
        }
    }

    private GetSettingsRecursiveLookup<TGetSettingsResponseCollection, TSettingName>(
        identities: string[], settings: TSettingName[], requestedVersion: ExchangeVersion,
        getSettingsMethod: GetSettingsMethod<TGetSettingsResponseCollection, TSettingName>,
        autodiscoverUrlRef: IRefParam<string>, hosts: string[], currentHostIndex: number = 0): IPromise<TGetSettingsResponseCollection> {
        //        for (var currentHostIndex = 0; currentHostIndex < hosts.length; currentHostIndex++) {

        if (currentHostIndex >= hosts.length) throw new AutodiscoverLocalException("***cannot determine based on autodiscover host names");

        var host = hosts[currentHostIndex];
        // var isScpHost:bool = currentHostIndex < scpHostCount;
        return this.TryGetAutodiscoverEndpointUrl(host, autodiscoverUrlRef).then((value) => {
            if (value) {
                return getSettingsMethod(
                    identities,
                    settings,
                    requestedVersion,
                    autodiscoverUrlRef,this).then((response) => {
                    // If we got this far, the response was successful, set Url.
                    this.Url = autodiscoverUrlRef.refvalue;

                    // Not external if Autodiscover endpoint found via SCP returned the settings.
                    //if (isScpHost) {
                    //    this.IsExternal = false;
                    //}
                    return response;
                });
            } else {
                currentHostIndex++;
                return this.GetSettingsRecursiveLookup(identities, settings, requestedVersion, getSettingsMethod, autodiscoverUrlRef, hosts, currentHostIndex);
            }
        },(err) => {
                currentHostIndex++;
                return this.GetSettingsRecursiveLookup(identities, settings, requestedVersion, getSettingsMethod, autodiscoverUrlRef, hosts, currentHostIndex);
            });
    }
    private GetUserSettingsInternal(smtpAddresses: string[], settings: UserSettingName[]): IPromise<GetUserSettingsResponseCollection> {

        //EwsUtilities.ValidateParam(smtpAddresses, "smtpAddresses");
        //EwsUtilities.ValidateParam(settings, "settings");

        return this.GetSettings<GetUserSettingsResponseCollection, UserSettingName>(
            smtpAddresses,
            settings,
            null,
            this.InternalGetUserSettings,
            () => { return EwsUtilities.DomainFromEmailAddress(smtpAddresses[0]); });


        ////var request = new GetUserSettingsRequest(this, this.url);
        ////request.Settings = userSettingNames;
        ////request.SmtpAddresses = smtpAddresses;

        ////var response = request.Execute();
        ////return <any>response;
    }

    public GetUserSettings(userSmtpAddress: string, ...userSettingNames: UserSettingName[]): IPromise<GetUserSettingsResponse> {

        //List < UserSettingName > requestedSettings = new List<UserSettingName>(userSettingNames);

        if (StringHelper.IsNullOrEmpty(userSmtpAddress)) {
            throw new ServiceValidationException("invalid autodiscover smtp address" /*Strings.InvalidAutodiscoverSmtpAddress*/);
        }
        var requestedSettings = userSettingNames || [];

        if (requestedSettings.length == 0) {
            throw new ServiceValidationException("invalid autodiscover setting count" /*Strings.InvalidAutodiscoverSettingsCount*/);
        }

        if (this.RequestedServerVersion < AutodiscoverService.MinimumRequestVersionForAutoDiscoverSoapService) {
            return this.InternalGetLegacyUserSettings(userSmtpAddress, requestedSettings);
        }
        else {
            return this.InternalGetSoapUserSettings(userSmtpAddress, requestedSettings);
        }
    }

    public GetUsersSettings(userSmtpAddresses: string[], ...userSettingNames: UserSettingName[]): IPromise<GetUserSettingsResponseCollection> {

        if (this.RequestedServerVersion < AutodiscoverService.MinimumRequestVersionForAutoDiscoverSoapService) {
            throw new ServiceVersionException(
                StringHelper.Format(/*Strings.AutodiscoverServiceIncompatibleWithRequestVersion*/ "autodiscover service is incompatible with requested versio, minimum versi supported is {0}",
                    AutodiscoverService.MinimumRequestVersionForAutoDiscoverSoapService));
        }

        ////var smtpAddresses: string[] = []// new List<string>(userSmtpAddresses);
        ////if (userSmtpAddresses)
        ////    userSmtpAddresses.forEach((s) => smtpAddresses.push(s));
        ////else throw new Error("invalid input");
        ////var settingNames: UserSettingName[] = [];// List<UserSettingName>(userSettingNames);
        ////if(userSettingNames)
        ////userSettingNames.forEach((s)=> settingNames.push());

        return this.GetUserSettingsInternal(userSmtpAddresses, userSettingNames); //calls getsettings
    }
    //InternalGetDomainSettings(domains: System.Collections.Generic.List<string>, settings: System.Collections.Generic.List<DomainSettingName>, requestedVersion: Data.ExchangeVersion, autodiscoverUrl: any): GetDomainSettingsResponseCollection{ throw new Error("AutodiscoverService.ts - InternalGetDomainSettings : Not implemented.");}
    private InternalGetLegacyUserSettings(emailAddress: string, requestedSettings: UserSettingName[]): IPromise<GetUserSettingsResponse> {
        throw new Error("Not implemented.");
    }
    private InternalGetLegacyUserSettingsPrivate<Tsettings>(
        emailAddress: string, redirectionEmailAddresses: string[],
        currentHop: IRefParam<number>): Tsettings {
        throw new Error("Not implemented.");
    }
    InternalGetSoapUserSettings(smtpAddress: string, requestedSettings: UserSettingName[]): IPromise<GetUserSettingsResponse> {
        var smtpAddresses: string[] = [];
        smtpAddresses.push(smtpAddress);

        var redirectionEmailAddresses: string[] = [];
        redirectionEmailAddresses.push(smtpAddress.toLowerCase());
        return this.InternalGetSoapUserSettingsRecursive(smtpAddresses, requestedSettings, redirectionEmailAddresses);
    }
    InternalGetSoapUserSettingsRecursive(smtpAddresses: string[], requestedSettings: UserSettingName[],
        redirectionEmailAddresses: string[], currentHop: number = 0): IPromise<GetUserSettingsResponse> {

        currentHop++;
        //if (currentHop > AutodiscoverService.AutodiscoverMaxRedirections)
        //    throw new AutodiscoverLocalException(Strings.AutodiscoverCouldNotBeLocated);

        return this.GetUserSettingsInternal(smtpAddresses, requestedSettings).then((resp) => {
            var response = resp.Responses[0];
            switch (response.ErrorCode) {
                case AutodiscoverErrorCode.RedirectAddress:
                    this.TraceMessage(
                        TraceFlags.AutodiscoverResponse,
                        StringHelper.Format("Autodiscover service returned redirection email address '{0}'.", response.RedirectTarget));

                    smtpAddresses.splice(0);
                    smtpAddresses.push(response.RedirectTarget.toLowerCase());
                    this.Url = null;
                    this.Domain = null;

                    // If this email address was already tried, we may have a loop
                    // in SCP lookups. Disable consideration of SCP records.
                    this.ThrowIfDuplicateRedirection(response.RedirectTarget, { refvalue: redirectionEmailAddresses });
                    return this.InternalGetSoapUserSettingsRecursive(smtpAddresses, requestedSettings, redirectionEmailAddresses, currentHop);
                    break;

                case AutodiscoverErrorCode.RedirectUrl:
                    this.TraceMessage(
                        TraceFlags.AutodiscoverResponse,
                        StringHelper.Format("Autodiscover service returned redirection URL '{0}'.", response.RedirectTarget));

                    this.Url = this.Credentials.AdjustUrl(response.RedirectTarget);
                    return this.InternalGetSoapUserSettingsRecursive(smtpAddresses, requestedSettings, redirectionEmailAddresses, currentHop);
                    break;

                case AutodiscoverErrorCode.NoError:
                default:
                    return response;
                //return IPromise.as(response);
            }
        },(err) => {
                throw err;
            });


    }
    InternalGetUserSettings(smtpAddresses: string[], settings: UserSettingName[],
        requestedVersion: ExchangeVersion, autodiscoverUrlRef: IRefParam<string>, thisref : AutodiscoverService, currentHop:number=0): IPromise<GetUserSettingsResponseCollection> {

        // The response to GetUserSettings can be a redirection. Execute GetUserSettings until we get back
        // a valid response or we've followed too many redirections.
        //this function is called recursively for that
        currentHop++;
        if (currentHop > AutodiscoverService.AutodiscoverMaxRedirections) {
            this.TraceMessage(
                TraceFlags.AutodiscoverConfiguration,
                StringHelper.Format("Maximum number of redirection hops {0} exceeded", AutodiscoverService.AutodiscoverMaxRedirections));

            throw new AutodiscoverLocalException("Autodiscover settings could not be located, max redirection reached"/*Strings.AutodiscoverCouldNotBeLocated*/);
        }
        //BUG  - Typescript bug, reference for "this" inside multiple layers of IPromise points to global this object;
        //(may be not) - this functional is called as delegate under Promise chaining, loss poiters to this.
        //var request: GetUserSettingsRequest = new GetUserSettingsRequest(this, autodiscoverUrlRef.refvalue);
        var request: GetUserSettingsRequest = new GetUserSettingsRequest(thisref, autodiscoverUrlRef.refvalue);

            request.SmtpAddresses = smtpAddresses;
            request.Settings = settings;
            return request.Execute().then((response) => {
                // Did we get redirected?
                if (response.ErrorCode == AutodiscoverErrorCode.RedirectUrl && response.RedirectionUrl != null) {
                    this.TraceMessage(
                        TraceFlags.AutodiscoverConfiguration,
                        StringHelper.Format("Request to {0} returned redirection to {1}", autodiscoverUrlRef.refvalue.toString(), response.RedirectionUrl));

                    // this url need be brought back to the caller.
                    //
                    autodiscoverUrlRef.refvalue = response.RedirectionUrl;
                    return this.InternalGetUserSettings(smtpAddresses, settings, requestedVersion, autodiscoverUrlRef, thisref, currentHop);
                }
                else {
                    return response;
                }
            },(err) => {

                });
    }
    //PrepareHttpWebRequestForUrl(url: System.Uri): Data.IEwsHttpWebRequest{ throw new Error("AutodiscoverService.ts - PrepareHttpWebRequestForUrl : Not implemented.");}
    //ProcessHttpErrorResponse(httpWebResponse: Data.IEwsHttpWebResponse, webException: any): any{ throw new Error("AutodiscoverService.ts - ProcessHttpErrorResponse : Not implemented.");}
    ProcessHttpErrorResponse(httpWebResponse: XMLHttpRequest, webException: any): any { /*throw new Error("Not implemented.")*/; }
    TraceResponse(response: XMLHttpRequest, memoryStream: any): any {
        //todo: implement tracing

        //this.ProcessHttpResponseHeaders(TraceFlags.AutodiscoverResponseHttpHeaders, response);

        //if (this.TraceEnabled) {
        //    if (!StringHelper.IsNullOrEmpty(response.ContentType) &&
        //        (response.ContentType.StartsWith("text/", StringComparison.OrdinalIgnoreCase) ||
        //        response.ContentType.StartsWith("application/soap", StringComparison.OrdinalIgnoreCase))) {
        //        this.TraceXml(TraceFlags.AutodiscoverResponse, memoryStream);
        //    }
        //    else {
        //        this.TraceMessage(TraceFlags.AutodiscoverResponse, "Non-textual response");
        //    }
        //}
    }
    TryGetAutodiscoverEndpointUrl(host: string, url: IOutParam<string>): IPromise<boolean> {
        url.outValue = null;

        var endpointsOut: IOutParam<AutodiscoverEndpoints> = { outValue: AutodiscoverEndpoints.None };
        return this.TryGetEnabledEndpointsForHost({ refvalue: host }, endpointsOut).then((value) => {
            if (value) {
                url.outValue = StringHelper.Format(AutodiscoverService.AutodiscoverSoapHttpsUrl, host);
                var endpoints = endpointsOut.outValue;
                // Make sure that at least one of the non-legacy endpoints is available.
                if (((endpoints & AutodiscoverEndpoints.Soap) != AutodiscoverEndpoints.Soap) &&
                    ((endpoints & AutodiscoverEndpoints.WsSecurity) != AutodiscoverEndpoints.WsSecurity) &&
                    ((endpoints & AutodiscoverEndpoints.WSSecuritySymmetricKey) != AutodiscoverEndpoints.WSSecuritySymmetricKey) &&
                    ((endpoints & AutodiscoverEndpoints.WSSecurityX509Cert) != AutodiscoverEndpoints.WSSecurityX509Cert) &&
                    ((endpoints & AutodiscoverEndpoints.OAuth) != AutodiscoverEndpoints.OAuth)) {
                    this.TraceMessage(
                        TraceFlags.AutodiscoverConfiguration,
                        StringHelper.Format("No Autodiscover endpoints are available  for host {0}", host));

                    return false;
                }

                // If we have WLID credentials, make sure that we have a WS-Security endpoint
                return true;
                if (this.Credentials instanceof WindowsLiveCredentials) {
                    if ((endpoints & AutodiscoverEndpoints.WsSecurity) != AutodiscoverEndpoints.WsSecurity) {
                        this.TraceMessage(
                            TraceFlags.AutodiscoverConfiguration,
                            StringHelper.Format("No Autodiscover WS-Security endpoint is available for host {0}", host));

                        return false;
                    }
                    else {
                        url.outValue = StringHelper.Format(AutodiscoverService.AutodiscoverSoapWsSecurityHttpsUrl, host);
                    }
                }
                else if (this.Credentials instanceof PartnerTokenCredentials) {
                    if ((endpoints & AutodiscoverEndpoints.WSSecuritySymmetricKey) != AutodiscoverEndpoints.WSSecuritySymmetricKey) {
                        this.TraceMessage(
                            TraceFlags.AutodiscoverConfiguration,
                            StringHelper.Format("No Autodiscover WS-Security/SymmetricKey endpoint is available for host {0}", host));

                        return false;
                    }
                    else {
                        url.outValue = StringHelper.Format(AutodiscoverService.AutodiscoverSoapWsSecuritySymmetricKeyHttpsUrl, host);
                    }
                }
                else if (this.Credentials instanceof X509CertificateCredentials) {
                    if ((endpoints & AutodiscoverEndpoints.WSSecurityX509Cert) != AutodiscoverEndpoints.WSSecurityX509Cert) {
                        this.TraceMessage(
                            TraceFlags.AutodiscoverConfiguration,
                            StringHelper.Format("No Autodiscover WS-Security/X509Cert endpoint is available for host {0}", host));

                        return false;
                    }
                    else {
                        url.outValue = StringHelper.Format(AutodiscoverService.AutodiscoverSoapWsSecurityX509CertHttpsUrl, host);
                    }
                }
                else if (this.Credentials instanceof OAuthCredentials) {
                    // If the credential is OAuthCredentials, no matter whether we have
                    // the corresponding x-header, we will go with OAuth.
                    url.outValue = StringHelper.Format(AutodiscoverService.AutodiscoverSoapHttpsUrl, host);
                }

                return true;
            }
            else {
                this.TraceMessage(
                    TraceFlags.AutodiscoverConfiguration,
                    StringHelper.Format("No Autodiscover endpoints are available for host {0}", host));

                return false;
            }
        },(err) => { throw err; });
    }
    TryGetEnabledEndpointsForHost(host: IRefParam<string>, endpoints: IOutParam<AutodiscoverEndpoints>, currentHop: number = 0): IPromise<boolean> {

        this.TraceMessage(
            TraceFlags.AutodiscoverConfiguration,
            StringHelper.Format("Determining which endpoints are enabled for host {0}", host.refvalue));
        currentHop++;

        // We may get redirected to another host. And therefore need to limit the number
        // of redirections we'll tolerate.
        if (currentHop > AutodiscoverService.AutodiscoverMaxRedirections) {
            this.TraceMessage(
                TraceFlags.AutodiscoverConfiguration,
                StringHelper.Format("Maximum number of redirection hops {0} exceeded", AutodiscoverService.AutodiscoverMaxRedirections));

            throw new AutodiscoverLocalException("Maximum redirection hop reached"/*Strings.MaximumRedirectionHopsExceeded*/);
        }

        var autoDiscoverUrl: string = StringHelper.Format(AutodiscoverService.AutodiscoverLegacyHttpsUrl, host.refvalue);

        endpoints.outValue = AutodiscoverEndpoints.None;

        var xhrOptions: IXHROptions = {
            type: "GET",
            url: autoDiscoverUrl,
        };


        //todo - optimize code, need to apply logic in failed errors as 401 go to onerror of xhr;
        return XHR(xhrOptions)
            .then((response: XMLHttpRequest) => {
            if (response != null) {
                var redirectUrl:any = null;;
                if ( /*"returns false aleways"*/ this.TryGetRedirectionResponse(response, { outValue: redirectUrl })) {
                    this.TraceMessage(
                        TraceFlags.AutodiscoverConfiguration,
                        StringHelper.Format("Host returned redirection to host '{0}'", redirectUrl.Host));

                    host.refvalue = UriHelper.getHost(redirectUrl);
                } else {
                    endpoints.outValue = this.GetEndpointsFromHttpResponse(response);

                    this.TraceMessage(
                        TraceFlags.AutodiscoverConfiguration,
                        StringHelper.Format("Host returned enabled endpoint flags: {0}", EnumHelper.ToString(AutodiscoverEndpoints, endpoints.outValue)));
                    return true;
                }
            } else {
                return false;
            }

        },(resperr: XMLHttpRequest) => {

                    if (resperr.status === 0) {
                        //catch (IOException ex)
                        this.TraceMessage(
                            TraceFlags.AutodiscoverConfiguration,
                            StringHelper.Format("I/O error: {0}", "unable to connect"));
                    } else if (resperr.status === 401) {
                        endpoints.outValue = this.GetEndpointsFromHttpResponse(resperr);

                        this.TraceMessage(
                            TraceFlags.AutodiscoverConfiguration,
                            StringHelper.Format("Host returned enabled endpoint flags: {0}", EnumHelper.ToString(AutodiscoverEndpoints, endpoints.outValue)));
                        return true;
                    } else {
                    //catch (WebException ex)
                    this.TraceMessage(
                        TraceFlags.AutodiscoverConfiguration,
                        StringHelper.Format("Request error: {0}, {1}", resperr.status, resperr.statusText));

                    //todo: possible?
                    // The exception response factory requires a valid HttpWebResponse,
                    // but there will be no web response if the web request couldn't be
                    // actually be issued (e.g. due to DNS error).
                    //if (ex.Response != null) {
                    //    response = this.HttpWebRequestFactory.CreateExceptionResponse(ex);
                    //}
                }
                return false;
            });

    }
    ThrowIfDuplicateRedirection(emailAddress: string, redirectionEmailAddresses: IRefParam<string[]>): void {

        // SMTP addresses are case-insensitive so entries are converted to lower-case.
        emailAddress = emailAddress.toLowerCase();

        if (redirectionEmailAddresses.refvalue.indexOf(emailAddress) >= 0) {
            //this.EnableScpLookup = false;
            throw new AutodiscoverLocalException("Detected redirection loop, Redirection address already tried");
        }
        else {
            redirectionEmailAddresses.refvalue.push(emailAddress);
        }

    }

    //TryGetPartnerAccess(targetTenantDomain: string, partnerAccessCredentials: any, targetTenantAutodiscoverUrl: any): boolean{ throw new Error("AutodiscoverService.ts - TryGetPartnerAccess : Not implemented.");}
    TryGetRedirectionResponse(response: XMLHttpRequest, redirectUrl: IOutParam<string>): boolean {
        this.TraceMessage(TraceFlags.DebugMessage,
            "cant determine redirectionResponse, 302 redirect code does not work in browser xhr and in Node.js http response");


        //redirectUrl.outValue = null;
        //if (AutodiscoverRequest.IsRedirectionResponse(response)) {
        //    // Get the redirect location and verify that it's valid.
        //    var location = response.getResponseHeader("Location");//. [HttpResponseHeader.Location];

        //    if (!StringHelper.IsNullOrEmpty(location)) {
        //        try
        //        {
        //            redirectUrl.outValue = location;

        //            // Check if URL is SSL and that the path matches.
        //            var match =  LegacyPathRegex.Match(redirectUrl.AbsolutePath);
        //            if ((redirectUrl.Scheme == UriHelper.UriSchemeHttps) &&
        //                match.Success) {
        //                this.TraceMessage(
        //                    TraceFlags.AutodiscoverConfiguration,
        //                    StringHelper.Format("Redirection URL found: '{0}'", redirectUrl));

        //                return true;
        //            }
        //        }
        //        catch (UriFormatException) {
        //            this.TraceMessage(
        //                TraceFlags.AutodiscoverConfiguration,
        //                StringHelper.Format("Invalid redirection URL was returned: '{0}'", location));
        //            return false;
        //        }
        //    }
        //}

        return false;
    }
    //TryLastChanceHostRedirection(emailAddress: string, redirectionUrl: string, settings: any): boolean{ throw new Error("AutodiscoverService.ts - TryLastChanceHostRedirection : Not implemented.");}
    //WriteLegacyAutodiscoverRequest(emailAddress: string, settings: ConfigurationSettingsBase, writer: any): any{ throw new Error("AutodiscoverService.ts - WriteLegacyAutodiscoverRequest : Not implemented.");}
}
export = AutodiscoverService;

//export module AutodiscoverService {
//    export var private static AutodiscoverLegacyPath: string = "/autodiscover/autodiscover.xml";
//    export var private static AutodiscoverLegacyUrl: string = "{0}://{1}/autodiscover/autodiscover.xml";
//    export var private static AutodiscoverLegacyHttpsUrl: string = "https://{0}/autodiscover/autodiscover.xml";
//    export var private static AutodiscoverLegacyHttpUrl: string = "http://{0}/autodiscover/autodiscover.xml";
//    export var private static AutodiscoverSoapHttpsUrl: string = "https://{0}/autodiscover/autodiscover.svc";
//    export var private static AutodiscoverSoapWsSecurityHttpsUrl: string = "https://{0}/autodiscover/autodiscover.svc/wssecurity";
//    export var private static AutodiscoverSoapWsSecuritySymmetricKeyHttpsUrl: string = "https://{0}/autodiscover/autodiscover.svc/wssecurity/symmetrickey";
//    export var private static AutodiscoverSoapWsSecurityX509CertHttpsUrl: string = "https://{0}/autodiscover/autodiscover.svc/wssecurity/x509cert";
//    export var private static AutodiscoverRequestNamespace: string = "http://schemas.microsoft.com/exchange/autodiscover/outlook/requestschema/2006";
//    export var static AutodiscoverMaxRedirections: number = 10;
//    export var private static AutodiscoverSoapEnabledHeaderName: string = "X-SOAP-Enabled";
//  export var private static AutodiscoverWsSecurityEnabledHeaderName: string = "X-WSSecurity-Enabled";
//    export var private static AutodiscoverWsSecuritySymmetricKeyEnabledHeaderName: string = "X-WSSecurity-SymmetricKey-Enabled";
//    export var private static AutodiscoverWsSecurityX509CertEnabledHeaderName: string = "X-WSSecurity-X509Cert-Enabled";
//    export var private static AutodiscoverOAuthEnabledHeaderName: string = "X-OAuth-Enabled";
//    export var private static MinimumRequestVersionForAutoDiscoverSoapService: Data.ExchangeVersion = Exchange2010;
//}

//todo converted to delegate type interface
interface GetSettingsMethod<TGetSettingsResponseCollection, TSettingName> {
    (smtpAddresses: string[], settings: TSettingName[], requestedVersion: ExchangeVersion, autodiscoverUrl: IRefParam<string> /*System.Uri*/, thisref:AutodiscoverService): IPromise<TGetSettingsResponseCollection>
}
//class GetSettingsMethod<TGetSettingsResponseCollection, TSettingName> extends System.MulticastDelegate {
//    BeginInvoke(smtpAddresses: System.Collections.Generic.List<string>, settings: System.Collections.Generic.List<T>, requestedVersion: Data.ExchangeVersion, autodiscoverUrl: any, callback: System.AsyncCallback, object: any): System.IAsyncResult { throw new Error("AutodiscoverService.ts - BeginInvoke : Not implemented."); }
//    EndInvoke(autodiscoverUrl: any, result: System.IAsyncResult): TGetSettingsResponseCollection { throw new Error("AutodiscoverService.ts - EndInvoke : Not implemented."); }
//    Invoke(smtpAddresses: System.Collections.Generic.List<string>, settings: System.Collections.Generic.List<T>, requestedVersion: Data.ExchangeVersion, autodiscoverUrl: any): TGetSettingsResponseCollection { throw new Error("AutodiscoverService.ts - Invoke : Not implemented."); }
//}



//module Microsoft.Exchange.WebServices.Autodiscover {
//}
//import _export = Microsoft.Exchange.WebServices.Autodiscover;
//export = _export;
