﻿using System;
using System.Linq;
using Altinn.Studio.Designer.Helpers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;

namespace Altinn.Studio.Designer.Configuration.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection RegisterSettingsByBaseType<TMarker>(this IServiceCollection services, IConfiguration configuration)
        {
            var typesToRegister = AltinnAssembliesScanner.GetTypesAssignedFrom<TMarker>()
                .Where(type => !type.IsInterface && !type.IsAbstract);

            foreach (var configType in typesToRegister)
            {
                services.RegisterSettings(configType, configuration);
            }

            return services;
        }

        public static IServiceCollection RegisterSettings(this IServiceCollection services, Type optionType, IConfiguration configuration, string section = null)
        {
            Func<IServiceCollection, IConfiguration, string, IServiceCollection> registerSettingsMethodObject = RegisterSettings<object>;
            var genericMethodTemplate = registerSettingsMethodObject.Method.GetGenericMethodDefinition().MakeGenericMethod(optionType);
            var configureSettingsMethodByType = (Func<IServiceCollection, IConfiguration, string, IServiceCollection>)Delegate.CreateDelegate(typeof(Func<IServiceCollection, IConfiguration, string, IServiceCollection>), genericMethodTemplate);

            return configureSettingsMethodByType(services, configuration, section);
        }

        public static IServiceCollection RegisterSettings<TOption>(this IServiceCollection services, IConfiguration configuration, string section = null)
            where TOption : class, new()
        {
            string sectionName = string.IsNullOrWhiteSpace(section) ? typeof(TOption).Name : section;
            ConfigureSettingsTypeBySection<TOption>(services, configuration, sectionName);

            return services;
        }

        private static void ConfigureSettingsTypeBySection<TOption>(this IServiceCollection services, IConfiguration configuration, string sectionName)
            where TOption : class, new()
        {
            services.Configure<TOption>(configuration.GetSection(sectionName));
            services.TryAddScoped(typeof(TOption), svc => ((IOptionsSnapshot<object>)svc.GetService(typeof(IOptionsSnapshot<TOption>))).Value);
        }

    }
}
