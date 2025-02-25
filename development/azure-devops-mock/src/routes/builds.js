import pQueue from 'p-queue';
import { between, sleep, designerDomain } from '../utils.js';
import axios from 'axios';

const queue = new pQueue({ concurrency: 1 });
/**
 * @see backend/src/Designer/appsettings.json
 */
const DEPLOY_DEFINITION_ID = 81;
const builds = [];
const deploys = [];
export const buildsRoute = async (req, res) => {
  const params = JSON.parse(req.body.parameters);
  const isDeploy = parseInt(req.body.definition.id) === DEPLOY_DEFINITION_ID;
  const webhookUrl =
    designerDomain() +
    '/designer/api/v1/' +
    (isDeploy ? 'checkdeploymentbuildstatus' : 'checkreleasebuildstatus');

  if (isDeploy) {
    deploys.push({
      app: params.APP_REPO,
      org: params.APP_OWNER,
      envName: params.APP_ENVIRONMENT,
      tagName: params.TAGNAME,
      time: new Date(),
    });
  }
  const ResourceOwner = params.APP_OWNER;
  const BuildNumber = between(10000000, 99999999);
  const buildData = {
    Id: BuildNumber,
    Status: 'notStarted',
    StartTime: new Date().toJSON(),
  };
  const azureDevOpsWebHookEventModel = {
    Resource: {
      BuildNumber,
      ResourceOwner,
    },
  };
  res.json(buildData);
  builds.push(buildData);

  await queue.add(async () => {
    await sleep(10000);
    try {
      await axios.post(webhookUrl, azureDevOpsWebHookEventModel);
    } catch (e) {
      console.error(e.message, webhookUrl);
    }
  });

  await queue.add(async () => {
    await sleep(10000);
    try {
      await axios.post(webhookUrl, azureDevOpsWebHookEventModel);
    } catch (e) {
      console.error(e.message, webhookUrl);
    }
  });
};
// http://localhost:6161/_apis/build/builds/80891942?api-version=5.1
export const buildRoute = async (req, res) => {
  const { BuildNumber } = req.params;
  const build = builds.find((b) => b.Id === parseInt(BuildNumber));
  if (build.Status === 'notStarted') {
    build.Status = 'inProgress';
    build.Result = 'none';
  }
  if (build.Status === 'inProgress') {
    build.Status = 'completed';
    build.Result = 'succeeded';
    build.finishTime = new Date().toJSON();
  }
  res.json(build);
};

export const kubernetesWrapperRoute = async (req, res) => {
  const { envName } = req.query;
  const deployed = deploys.find((deploy) => deploy.envName === envName);
  const result = [];
  if (deployed) {
    result.push({
      version: deployed.tagName,
      release: [deployed.org, deployed.app].join('-'),
    });
  }
  res.json(result);
};
