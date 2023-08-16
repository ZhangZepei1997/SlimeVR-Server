import {
  generateSchemaTypes,
  generateReactQueryComponents,
} from '@openapi-codegen/typescript';
import { defineConfig } from '@openapi-codegen/cli';
export default defineConfig({
  firmwareTool: {
    from: {
      source: 'url',
      url: 'http://localhost:3000/api-json',
    },
    outputDir: 'src/firmware-tool-api',
    to: async (context) => {
      const filenamePrefix = 'firmwareTool';
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix,
      });
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles,
      });
    },
  },
});
