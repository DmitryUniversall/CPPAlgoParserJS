import FunctionDefinition from '../../../core/entities/ast/top_level/declarations/FunctionDefinition';
import ObjectDescription from './entities/description/ObjectDescription';
import FunctionDefinitionDescription from './entities/description/descriptions/FunctionDefinitionDescription';
import Statement from '../../../core/entities/ast/statements/Statement';
import AvroraRow from './entities/AvroraRow';
import AvroraGenerator from './AvroraGenerator';
import TranslationUnit from '../../../core/entities/ast/translation_unit/TranslationUnit';
import TopLevelDeclaration from '../../../core/entities/ast/top_level/TopLevelDeclaration';
import TopLevelDeclarationType from '../../../core/entities/ast/top_level/TopLevelDeclarationType';
import ObjectDescriptionType from './entities/description/ObjectDescriptionType';
import { generateAvroraTypeExpressionString } from './utils/generate';

export default class AvroraTranslationUnitGenerator {
    private readonly source: string;
    private readonly translationUnit: TranslationUnit;

    constructor(source: string, translationUnit: TranslationUnit) {
        this.source = source;
        this.translationUnit = translationUnit;
    }

    private generateStatementRows(statements: Statement[]): AvroraRow[] {
        const generator = new AvroraGenerator(this.source, statements, 0);
        return generator.generateRowsForAlgorithm();
    }

    private generateDescriptionForFunctionDefinition(definition: FunctionDefinition): FunctionDefinitionDescription {
        return {
            type: ObjectDescriptionType.FUNCTION_DEFINITION,
            returnType: generateAvroraTypeExpressionString(definition.returnType),
            name: definition.name.name,
            params: definition.params.flatMap((it) => `${generateAvroraTypeExpressionString(it.type)} ${it.name} - ОПИСАНИЕ`).join('; '),
            body: this.generateStatementRows(definition.body.body),
        };
    }

    private generateDescriptionForTopLevelDeclaration(declaration: TopLevelDeclaration): ObjectDescription {
        if (declaration.type === TopLevelDeclarationType.FUNCTION_DEFINITION) return this.generateDescriptionForFunctionDefinition(declaration);

        throw new Error(`Unsupported top level declaration type: '${declaration.type}'`);
    }

    public generateDescriptionsForTranslationUnit(): ObjectDescription[] {
        const descriptions: ObjectDescription[] = [];
        for (const declaration of this.translationUnit.declarations) descriptions.push(this.generateDescriptionForTopLevelDeclaration(declaration));
        return descriptions;
    }
}
