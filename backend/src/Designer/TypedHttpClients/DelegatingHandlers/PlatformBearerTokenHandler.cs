using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using Altinn.Common.AccessTokenClient.Services;
using Altinn.Studio.Designer.Configuration;
using Altinn.Studio.Designer.TypedHttpClients.AltinnAuthentication;
using Microsoft.Extensions.Options;

namespace Altinn.Studio.Designer.TypedHttpClients.DelegatingHandlers
{
    /// <summary>
    /// Adds a Bearer token to the Authorization header
    /// </summary>
    public class PlatformBearerTokenHandler : DelegatingHandler
    {
        private readonly IAltinnAuthenticationClient _altinnAuthenticationClient;
        private readonly IAccessTokenGenerator _accesTokenGenerator;
        private readonly GeneralSettings _generalSettings;
        private const string AccessTokenIssuerProd = "studio";
        private const string AccessTokenIssuerDev = "dev-studio";
        private const string AccessTokenIssuerStaging = "staging-studio";
        private const string AccessTokenApp = "studio.designer";

        /// <summary>
        /// Constructor
        /// </summary>
        public PlatformBearerTokenHandler(
            IAccessTokenGenerator accessTokenGenerator,
            IAltinnAuthenticationClient altinnAuthenticationClient,
            GeneralSettings generalSettings)
        {
            _altinnAuthenticationClient = altinnAuthenticationClient;
            _accesTokenGenerator = accessTokenGenerator;
            _generalSettings = generalSettings;
        }

        /// <summary>
        /// Checks to see if response is success
        /// Otherwise, throws Exception
        /// </summary>
        /// <param name="request">System.Net.Http.HttpResponseMessage</param>
        /// <param name="cancellationToken">System.Threading.CancellationToken</param>
        /// <returns>HttpResponseMessage</returns>
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            string issuer;
            if (_generalSettings.HostName.Contains("dev"))
            {
                issuer = AccessTokenIssuerDev;
            }
            else if (_generalSettings.HostName.Contains("staging"))
            {
                issuer = AccessTokenIssuerStaging;
            }
            else
            {
                issuer = AccessTokenIssuerProd;
            }

            string designerToken = _accesTokenGenerator.GenerateAccessToken(issuer, AccessTokenApp);
            string altinnToken = await _altinnAuthenticationClient.ConvertTokenAsync(designerToken, request.RequestUri);

            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", altinnToken);
            return await base.SendAsync(request, cancellationToken);
        }
    }
}
