import TopLevelFunctionDeclaration from '../../../core/entities/ast/top_level/declarations/TopLevelFunctionDeclaration';
import Description from './entities/description/Description';
import FunctionDescription from './entities/description/descriptions/FunctionDescription';
import Statement from '../../../core/entities/ast/statements/Statement';
import AvroraRow from './entities/AvroraRow';
import AvroraGenerator from './AvroraGenerator';
import TranslationUnit from '../../../core/entities/ast/translation_unit/TranslationUnit';
import TopLevelDeclaration from '../../../core/entities/ast/top_level/TopLevelDeclaration';
import TopLevelDeclarationType from '../../../core/entities/ast/top_level/TopLevelDeclarationType';
import DescriptionType from './entities/description/DescriptionType';
import { generateAvroraTypeExpressionString } from './utils/generate';
import CallableDefinition from '../../../core/entities/ast/constructions/callable/definitions/CallableDefinition';
import CallableDefinitionType from '../../../core/entities/ast/constructions/callable/definitions/CallableDefinitionType';
import FunctionDeclaration from '../../../core/entities/ast/constructions/functions/FunctionDeclaration';

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

    private generateFunctionDescription(topLevelDeclaration: TopLevelFunctionDeclaration): FunctionDescription {
        const declaration: FunctionDeclaration = topLevelDeclaration.declaration;

        const returnType: string = generateAvroraTypeExpressionString(declaration.returnType) + " - ОПИСАНИЕ";
        const name: string = declaration.name.scope.join('::') + declaration.name.name;
        const params: string = declaration.params.flatMap((it) => `${generateAvroraTypeExpressionString(it.type)} ${it.name} - ОПИСАНИЕ`).join('; ');

        const definition: CallableDefinition | null = topLevelDeclaration.declaration?.definition;

        return {
            type: DescriptionType.FUNCTION_DECLARATION,
            returnType: returnType,
            name: name,
            params: params,
            body: definition?.type === CallableDefinitionType.BODY ? this.generateStatementRows(definition.body.body) : [],
        };
    }

    private generateDescriptionForTopLevelDeclaration(declaration: TopLevelDeclaration): Description {
        if (declaration.type === TopLevelDeclarationType.FUNCTION_DECLARATION) return this.generateFunctionDescription(declaration);

        throw new Error(`Unsupported top level declaration type: '${declaration.type}'`);
    }

    public generateDescriptionsForTranslationUnit(): Description[] {
        const descriptions: Description[] = [];
        for (const declaration of this.translationUnit.declarations) descriptions.push(this.generateDescriptionForTopLevelDeclaration(declaration));
        return descriptions;
    }
}
