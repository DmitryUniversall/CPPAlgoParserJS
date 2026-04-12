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
import { generateAvroraExpressionString, generateAvroraTypeExpressionString } from './utils/generate';
import CallableDefinition from '../../../core/entities/ast/constructions/callable/definitions/CallableDefinition';
import CallableDefinitionType from '../../../core/entities/ast/constructions/callable/definitions/CallableDefinitionType';
import FunctionDeclaration from '../../../core/entities/ast/constructions/functions/FunctionDeclaration';
import ClassDescription from './entities/description/descriptions/classes/ClassDescription';
import MethodClassMember from '../../../core/entities/ast/constructions/classes/members/members/MethodClassMember';
import ClassMemberType from '../../../core/entities/ast/constructions/classes/members/ClassMemberType';
import MethodDescription from './entities/description/descriptions/classes/MethodDescription';
import FieldClassMember from '../../../core/entities/ast/constructions/classes/members/members/FieldClassMember';
import FieldDescription from './entities/description/descriptions/classes/FieldDescription';
import TopLevelClassDeclaration from '../../../core/entities/ast/top_level/declarations/TopLevelClassDeclaration';
import ClassDeclaration from '../../../core/entities/ast/constructions/classes/ClassDeclaration';
import ClassDefinition from '../../../core/entities/ast/constructions/classes/ClassDefinition';
import QualifiedName from '../../../core/entities/qualified_name/QualifiedName';
import ClassName from '../../../core/entities/ast/constructions/classes/ClassName';
import CallableParameter from '../../../core/entities/ast/constructions/callable/params/CallableParameter';
import ClassInheritance from '../../../core/entities/ast/constructions/classes/inheritance/ClassInheritance';
import BaseClassDescription from './entities/description/descriptions/classes/BaseClassDescription';
import MethodDeclaration from '../../../core/entities/ast/constructions/classes/methods/MethodDeclaration';
import ConstructorDeclaration from '../../../core/entities/ast/constructions/classes/constructors/ConstructorDeclaration';
import ConstructorClassMember from '../../../core/entities/ast/constructions/classes/members/members/ConstructorClassMember';
import ConstructorDefinition from '../../../core/entities/ast/constructions/classes/constructors/ConstructorDefinition';
import CreateRowSchema from './entities/internal/CreateRowSchema';
import GeneratedAvroraRow from './entities/internal/GeneratedAvroraRow';
import ConstructorInitializerTargetType from '../../../core/entities/ast/constructions/classes/constructors/initializers/ConstructorInitializerTargetType';
import ConstructorInitializer from '../../../core/entities/ast/constructions/classes/constructors/initializers/ConstructorInitializer';
import Expression from '../../../core/entities/ast/expressions/Expression';

export default class AvroraTranslationUnitGenerator {
    private readonly source: string;
    private readonly translationUnit: TranslationUnit;

    constructor(source: string, translationUnit: TranslationUnit) {
        this.source = source;
        this.translationUnit = translationUnit;
    }

    private createRowWith(schema: CreateRowSchema): GeneratedAvroraRow {
        return {
            number: schema.number,
            action: schema.action !== undefined ? schema.action : null,
            next: schema.next,
            condition: schema.condition !== undefined ? schema.condition : null,
            comment: schema.comment !== undefined ? schema.comment : null,
            subrow: schema.subrow !== undefined ? schema.subrow : null,
            jumpKind: schema.jumpKind !== undefined ? schema.jumpKind : null,
        };
    }

    private generateStatementRows(statements: Statement[]): AvroraRow[] {
        const generator = new AvroraGenerator(this.source, statements, 0);
        return generator.generateRowsForAlgorithm();
    }

    private generateExpressionString(expression: Expression): string {
        return generateAvroraExpressionString(expression);
    }

    private generateQualifiedNameString(name: QualifiedName): string {
        return name.scope.length > 0 ? `${name.scope.join('::')}::${name.name}` : name.name;
    }

    private generateClassNameString(className: ClassName): string {
        const baseName: string = this.generateQualifiedNameString(className.name);

        if (className.genericParams.length === 0) return baseName;

        const genericParams: string = className.genericParams.map((it) => generateAvroraTypeExpressionString(it)).join(', ');

        return `${baseName}<${genericParams}>`;
    }

    private generateParamsString(params: CallableParameter[]): string {
        return params.map((it) => `${generateAvroraTypeExpressionString(it.type)} ${it.name} - ОПИСАНИЕ`).join('; ');
    }

    private generateFunctionDescription(topLevelDeclaration: TopLevelFunctionDeclaration): FunctionDescription {
        const declaration: FunctionDeclaration = topLevelDeclaration.declaration;

        const returnType: string = generateAvroraTypeExpressionString(declaration.returnType);
        const name: string = this.generateQualifiedNameString(declaration.name);
        const params: string = this.generateParamsString(declaration.params);

        const definition: CallableDefinition | null = declaration.definition;

        return {
            type: DescriptionType.FUNCTION_DECLARATION,
            returnType: returnType,
            name: name,
            params: params,
            body: definition?.type === CallableDefinitionType.BODY ? this.generateStatementRows(definition.body.body) : [],
        };
    }

    private generateBaseClassDescriptions(inheritance: ClassInheritance | null): BaseClassDescription[] {
        if (inheritance === null) return [];

        return inheritance.bases.map((base) => ({
            isVirtual: inheritance.isVirtual,
            accessModifier: base.accessModifier,
            baseClassName: this.generateClassNameString(base.className),
        }));
    }

    private generateFieldDescriptions(member: FieldClassMember): FieldDescription[] {
        const typeString: string = generateAvroraTypeExpressionString(member.statement.varType);

        return member.statement.declarations.map((declaration) => ({
            name: declaration.name,
            description: 'ОПИСАНИЕ',
            typeString: typeString,
            accessModifier: member.accessModifier,
        }));
    }

    private generateMethodFunctionDescription(methodDeclaration: MethodDeclaration): FunctionDescription {
        const returnType: string = generateAvroraTypeExpressionString(methodDeclaration.returnType) + ' - ОПИСАНИЕ';
        const name: string = this.generateQualifiedNameString(methodDeclaration.name);
        const params: string = this.generateParamsString(methodDeclaration.params);

        const definition: CallableDefinition | null = methodDeclaration.definition;

        return {
            type: DescriptionType.FUNCTION_DECLARATION,
            returnType: returnType,
            name: name,
            params: params,
            body: definition?.type === CallableDefinitionType.BODY ? this.generateStatementRows(definition.body.body) : [],
        };
    }

    private generateMethodDescription(member: MethodClassMember): MethodDescription {
        const functionDescription: FunctionDescription = this.generateMethodFunctionDescription(member.methodDeclaration);

        return {
            name: functionDescription.name,
            description: 'ОПИСАНИЕ',
            functionDescription: functionDescription,
            accessModifier: member.accessModifier,
            isConstructor: false
        };
    }

    private generateClassInitializerRow(initializer: ConstructorInitializer, rowNumber: number, next: number): AvroraRow {
        const args: string = initializer.value.args.flatMap((it) => this.generateExpressionString(it)).join(', ');

        switch (initializer.targetType) {
            case ConstructorInitializerTargetType.MEMBER:
                return this.createRowWith({
                    number: rowNumber,
                    action: `инициализация поля ${initializer.targetName} значением ${args}`,
                    next: next,
                });
            case ConstructorInitializerTargetType.BASE_CLASS:
                return this.createRowWith({
                    number: rowNumber,
                    action: `вызов конструктора базового класса ${initializer.targetName.name.name} с параметрами ${args}`,
                    next: next,
                });
            case ConstructorInitializerTargetType.DELEGATING:
                return this.createRowWith({
                    number: rowNumber,
                    action: `вызов конструктора ${initializer.targetName.name.name} с параметрами ${args}`,
                    next: next,
                });
        }
    }

    private generateConstructorDefinitionBody(constructorDefinition: ConstructorDefinition): AvroraRow[] {
        let rowNumber: number = 1;
        const body: AvroraRow[] = [];

        if (constructorDefinition.initializerList !== null) {
            constructorDefinition.initializerList.forEach((item) => {
                body.push(this.generateClassInitializerRow(item, rowNumber, rowNumber + 1));
                rowNumber++;
            });
        }

        if (constructorDefinition.callableDefinition !== null && constructorDefinition.callableDefinition?.type === CallableDefinitionType.BODY) {
            body.push(...this.generateStatementRows(constructorDefinition.callableDefinition.body.body));
        }

        return body;
    }

    private generateConstructorFunctionDescription(constructorDeclaration: ConstructorDeclaration): FunctionDescription {
        const name: string = this.generateQualifiedNameString(constructorDeclaration.name.name);
        const params: string = this.generateParamsString(constructorDeclaration.params);

        const definition: ConstructorDefinition | null = constructorDeclaration.definition;

        return {
            type: DescriptionType.FUNCTION_DECLARATION,
            returnType: 'нет',
            name: name,
            params: params,
            body: definition !== null ? this.generateConstructorDefinitionBody(definition) : [],
        };
    }

    private generateConstructorDescription(member: ConstructorClassMember): MethodDescription {
        const functionDescription: FunctionDescription = this.generateConstructorFunctionDescription(member.constructorDeclaration);

        return {
            name: functionDescription.name,
            description: 'ОПИСАНИЕ',
            functionDescription: functionDescription,
            accessModifier: member.accessModifier,
            isConstructor: true,
        };
    }

    private generateClassDescription(topLevelDeclaration: TopLevelClassDeclaration): ClassDescription {
        const declaration: ClassDeclaration = topLevelDeclaration.declaration;
        const definition: ClassDefinition | null = declaration.definition;

        if (definition === null) {
            return {
                name: this.generateClassNameString(declaration.className),
                description: 'ОПИСАНИЕ',
                bases: [],
                fields: [],
                methods: [],
            };
        }

        const fields: FieldDescription[] = definition.members
            .filter((member): member is FieldClassMember => member.type === ClassMemberType.FIELD)
            .flatMap((member) => this.generateFieldDescriptions(member));

        const methods: MethodDescription[] = definition.members
            .filter((member): member is MethodClassMember => member.type === ClassMemberType.METHOD)
            .map((member) => this.generateMethodDescription(member));

        definition.members
            .filter((member): member is ConstructorClassMember => member.type === ClassMemberType.CONSTRUCTOR)
            .forEach((it) => methods.push(this.generateConstructorDescription(it)));

        return {
            name: this.generateClassNameString(declaration.className),
            description: 'ОПИСАНИЕ',
            bases: this.generateBaseClassDescriptions(definition.inheritance),
            fields: fields,
            methods: methods,
        };
    }

    private generateDescriptionForTopLevelDeclaration(declaration: TopLevelDeclaration): Description | ClassDescription {
        if (declaration.type === TopLevelDeclarationType.FUNCTION_DECLARATION) {
            return this.generateFunctionDescription(declaration);
        }

        if (declaration.type === TopLevelDeclarationType.CLASS_DECLARATION) {
            return this.generateClassDescription(declaration);
        }

        throw new Error(`Unsupported top level declaration type: '${declaration.type}'`);
    }

    public generateDescriptionsForTranslationUnit(): Array<Description | ClassDescription> {
        const descriptions: Description[] = [];

        for (const declaration of this.translationUnit.declarations) {
            descriptions.push(this.generateDescriptionForTopLevelDeclaration(declaration));
        }

        return descriptions;
    }
}
