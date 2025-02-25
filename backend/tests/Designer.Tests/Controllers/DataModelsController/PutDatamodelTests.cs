﻿using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Mime;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Web;
using System.Xml;
using System.Xml.Schema;
using Altinn.Studio.DataModeling.Converter.Json;
using Altinn.Studio.DataModeling.Converter.Json.Strategy;
using Altinn.Studio.DataModeling.Converter.Metadata;
using Altinn.Studio.DataModeling.Json;
using Altinn.Studio.Designer.Configuration;
using Altinn.Studio.Designer.Controllers;
using Altinn.Studio.Designer.Filters;
using Altinn.Studio.Designer.Models;
using Altinn.Studio.Designer.Services.Interfaces;
using Designer.Tests.Controllers.ApiTests;
using Designer.Tests.Controllers.DataModelsController.Utils;
using Designer.Tests.Mocks;
using Designer.Tests.Utils;
using FluentAssertions;
using Json.Schema;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using SharedResources.Tests;
using Xunit;

namespace Designer.Tests.Controllers.DataModelsController;

public class PutDatamodelTests : ApiTestsBase<DatamodelsController, PutDatamodelTests>, IDisposable
{
    private const string VersionPrefix = "/designer/api";

    private HttpRequestMessage HttpRequestMessage { get; set; }
    private HttpResponseMessage HttpResponseMessage { get; set; }

    private string TargetTestRepository { get; }
    private string CreatedTestRepoPath { get; set; }

    private const string MinimumValidJsonSchema = "{\"$schema\":\"https://json-schema.org/draft/2020-12/schema\",\"$id\":\"schema.json\",\"type\":\"object\",\"properties\":{\"root\":{\"$ref\":\"#/$defs/rootType\"}},\"$defs\":{\"rootType\":{\"properties\":{\"keyword\":{\"type\":\"string\"}}}}}";

    private const string OneOfAndPropertiesSchema =
        "{\"$schema\":\"https://json-schema.org/draft/2020-12/schema\",\"$id\":\"schema.json\",\"type\":\"object\",\"oneOf\":[{\"$ref\":\"#/$defs/otherType\"}],\"properties\":{\"root\":{\"$ref\":\"#/$defs/rootType\"}},\"$defs\":{\"rootType\":{\"properties\":{\"keyword\":{\"type\":\"string\"}}},\"otherType\":{\"properties\":{\"keyword\":{\"type\":\"string\"}}}}}";


    public PutDatamodelTests(WebApplicationFactory<DatamodelsController> factory) : base(factory)
    {
        TargetTestRepository = TestDataHelper.GenerateTestRepoName();
    }

    protected override void ConfigureTestServices(IServiceCollection services)
    {
        services.Configure<ServiceRepositorySettings>(c =>
            c.RepositoryLocation = TestRepositoriesLocation);
        services.AddSingleton<IGitea, IGiteaMock>();
    }

    /// <summary>
    /// Will be executed after each test.
    /// </summary>
    public void Dispose()
    {
        if (!string.IsNullOrWhiteSpace(CreatedTestRepoPath))
        {
            TestDataHelper.DeleteDirectory(CreatedTestRepoPath);
        }
    }

    [Theory]
    [InlineData("testModel.schema.json")]
    [InlineData("App/models/testModel.schema.json")]
    [InlineData("/App/models/testModel.schema.json")]
    [InlineData("App%2Fmodels%2FtestModel.schema.json")]
    public async Task ValidInput_ShouldReturn_NoContent_And_Create_Files(string modelPath)
    {
        var url = $"{VersionPrefix}/ttd/{TargetTestRepository}/datamodels/datamodel?modelPath={modelPath}";
        var fileName = Path.GetFileName(HttpUtility.UrlDecode(modelPath));
        var modelName = fileName.Remove(fileName.Length - ".schema.json".Length);

        await Given.That
            .RepositoryCopiedForTest("ttd", "hvem-er-hvem", "testUser", TargetTestRepository);

        And.RequestMessageCreatedFromJsonString(MinimumValidJsonSchema, url);

        await When.HttpRequestSent();
        Then.HttpResponseMessage.StatusCode.Should().Be(HttpStatusCode.NoContent);
        await And.FilesWithCorrectNameAndContentShouldBeCreated(modelName);
    }

    [Theory]
    [InlineData("testModel.schema.json", OneOfAndPropertiesSchema, DatamodelingErrorCodes.JsonSchemaConvertError)]
    public async Task ValidInput_ShouldReturn_NoContent_And_Create_Files2(string modelPath, string schema, string expectedErrorCode)
    {
        string url = $"{VersionPrefix}/ttd/{TargetTestRepository}/datamodels/datamodel?modelPath={modelPath}";
        await Given.That
            .RepositoryCopiedForTest("ttd", "hvem-er-hvem", "testUser", TargetTestRepository);

        And.RequestMessageCreatedFromJsonString(schema, url);
        await When.HttpRequestSent();
        Then.HttpResponseMessage.StatusCode.Should().Be(HttpStatusCode.InternalServerError);

        var errorResponse = await HttpResponseMessage.Content.ReadAsAsync<ApiError>();

        errorResponse.ErrorCode.Should().Be(expectedErrorCode);
    }

    private async Task RepositoryCopiedForTest(string org, string repository, string developer, string targetRepository)
    {
        CreatedTestRepoPath = await TestDataHelper.CopyRepositoryForTest(org, repository, developer, targetRepository);
    }

    private void RequestMessageCreatedFromJsonString(string json, string url)
    {
        HttpRequestMessage = new HttpRequestMessage(HttpMethod.Put, url)
        {
            Content = new StringContent(json, Encoding.UTF8, MediaTypeNames.Application.Json)
        };
    }

    private async Task HttpRequestSent()
    {
        HttpResponseMessage = await HttpClient.Value.SendAsync(HttpRequestMessage);
    }

    private async Task FilesWithCorrectNameAndContentShouldBeCreated(string modelName)
    {
        var location = Path.GetFullPath(Path.Combine(CreatedTestRepoPath, "App", "models"));
        var jsonSchemaLocation = Path.Combine(location, $"{modelName}.schema.json");
        var xsdSchemaLocation = Path.Combine(location, $"{modelName}.xsd");
        var metamodelLocation = Path.Combine(location, $"{modelName}.metadata.json");

        Assert.True(File.Exists(xsdSchemaLocation));
        Assert.True(File.Exists(metamodelLocation));
        Assert.True(File.Exists(jsonSchemaLocation));

        await VerifyXsdFileContent(xsdSchemaLocation);
        FileContentVerifier.VerifyJsonFileContent(jsonSchemaLocation, MinimumValidJsonSchema);
        VerifyMetadataContent(metamodelLocation);
    }

    private static async Task VerifyXsdFileContent(string path)
    {
        async Task<string> SerializeXml(XmlSchema schema)
        {
            await using var sw = new Utf8StringWriter();
            await using var xw = XmlWriter.Create(sw, new XmlWriterSettings { Indent = true, Async = true });
            schema.Write(xw);
            return sw.ToString();
        }

        var jsonSchema = JsonSchema.FromText(MinimumValidJsonSchema);
        var converter = new JsonSchemaToXmlSchemaConverter(new JsonSchemaNormalizer());
        var xsd = converter.Convert(jsonSchema);
        var xsdContent = await SerializeXml(xsd);
        VerifyFileContent(path, xsdContent);
    }

    private static void VerifyMetadataContent(string path)
    {
        var jsonSchemaConverterStrategy = JsonSchemaConverterStrategyFactory.SelectStrategy(JsonSchema.FromText(MinimumValidJsonSchema));
        var metamodelConverter = new JsonSchemaToMetamodelConverter(jsonSchemaConverterStrategy.GetAnalyzer());
        var modelMetadata = metamodelConverter.Convert(MinimumValidJsonSchema);
        FileContentVerifier.VerifyJsonFileContent(path, JsonSerializer.Serialize(modelMetadata));
    }

    private static void VerifyFileContent(string path, string expectedContent)
    {
        var fileContent = File.ReadAllText(path);
        expectedContent.Should().Be(fileContent);
    }
}
