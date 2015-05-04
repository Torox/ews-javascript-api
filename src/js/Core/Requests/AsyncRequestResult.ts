import ServiceRequestBase = require("./ServiceRequestBase");
import IEwsHttpWebRequest = require("../../Interfaces/IEwsHttpWebRequest");
import ExchangeService = require("../ExchangeService");
			
 class AsyncRequestResult {
	ServiceRequest: ServiceRequestBase;
	WebRequest: IEwsHttpWebRequest;
	WebAsyncResult: any /*System.IAsyncResult*/;
	AsyncState: any;
	AsyncWaitHandle: any /*System.Threading.WaitHandle*/;
	CompletedSynchronously: boolean;
	IsCompleted: boolean;
	ExtractServiceRequest<T>(exchangeService: ExchangeService, asyncResult: any /*System.IAsyncResult*/): T{ throw new Error("Not implemented.");}
}
export = AsyncRequestResult;


//------------modulename->Microsoft.Exchange.WebServices.Data------------


			
