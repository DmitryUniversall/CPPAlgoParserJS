import ConstructionParserUtils from '../generics/ConstructionParserUtils';
import Token from '../../../core/entities/token/Token';
import ClassMemberLookAheadResult from '../entities/ClassMemberLookAheadResult';
import ClassMemberLookAheadKind from '../entities/ClassMemberLookAheadKind';
import TokenType from '../../../core/entities/token/TokenType';
import { keywords } from '../../../core/entities/keyword/keywords/keywords';
import ClassMember from '../../../core/entities/ast/constructions/classes/members/ClassMember';
import TypeExpression from '../../../core/entities/ast/type/TypeExpression';
import { operators } from '../../../core/entities/operator/operators/operators';
import OperatorType from '../../../core/entities/operator/OperatorType';
import ClassDeclaration from '../../../core/entities/ast/constructions/classes/ClassDeclaration';
import StatementType from '../../../core/entities/ast/statements/StatementType';
import ClassMemberType from '../../../core/entities/ast/constructions/classes/members/ClassMemberType';
import AccessModifierType from '../../../core/entities/modifier/access/AccessModifierType';
import FunctionParser from './FunctionParser';
import FunctionParameter from '../../../core/entities/ast/constructions/functions/params/FunctionParameter';
import Statement from '../../../core/entities/ast/statements/Statement';
import NestedClassClassMember from '../../../core/entities/ast/constructions/classes/members/members/NestedClassClassMember';
import ClassInheritance from '../../../core/entities/ast/constructions/classes/inheritance/ClassInheritance';
import ClassDefinition from '../../../core/entities/ast/constructions/classes/ClassDefinition';
import ClassName from '../../../core/entities/ast/constructions/classes/ClassName';
import InheritanceBaseClass from '../../../core/entities/ast/constructions/classes/inheritance/InheritanceBaseClass';
import FunctionDeclaration from '../../../core/entities/ast/constructions/functions/FunctionDeclaration';
import FunctionPrefixModifierType from '../../../core/entities/ast/constructions/functions/modifiers/FunctionPrefixModifierType';

export default class ClassParser extends ConstructionParserUtils {
    private parseFunctionDeclaration(): FunctionDeclaration {
        const parser = new FunctionParser(this.source, this.tokens, this.position);
        const result: FunctionDeclaration = parser.parseFunctionDeclaration();
        this.position = parser.currentPosition;
        return result;
    }

    private parseClassName(): ClassName {
        const classNameString: string = this.expectNextToken(TokenType.IDENTIFIER).text;

        let genericParams: TypeExpression[] = [];
        if (this.peek()?.text === operators[OperatorType.LT].literal) genericParams = this.parseTypeParameters();

        return {
            name: classNameString,
            genericParams: genericParams,
        };
    }

    private lookAheadForClassMember(className: string): ClassMemberLookAheadResult {
        let current: Token | null = this.peekOffset(0);
        if (current === null) return { kind: ClassMemberLookAheadKind.NONE };

        if (current.tokenType === TokenType.KEYWORD && current.text === keywords.CLASS.literal) return { kind: ClassMemberLookAheadKind.NESTED_CLASS };

        if (
            current.tokenType === TokenType.KEYWORD &&
            (current.text === keywords.PUBLIC?.literal || current.text === keywords.PRIVATE?.literal || current.text === keywords.PROTECTED?.literal) &&
            this.peekOffset(1)?.tokenType === TokenType.COLON
        ) {
            return { kind: ClassMemberLookAheadKind.ACCESS_MODIFIER };
        }

        if (current.tokenType === TokenType.IDENTIFIER && current.text === className && this.peekOffset(1)?.tokenType === TokenType.L_PAREN)
            return { kind: ClassMemberLookAheadKind.CONSTRUCTOR };

        if (FunctionPrefixModifierType[current.text.toUpperCase() as keyof typeof FunctionPrefixModifierType] !== undefined)
            return { kind: ClassMemberLookAheadKind.METHOD };

        let pointer: number = this.position;

        try {
            const { endPosition } = this.typeLookAhead();
            pointer = endPosition;
        } catch {
            return { kind: ClassMemberLookAheadKind.NONE };
        }

        current = this.tokens[pointer];

        if (!current || current.tokenType !== TokenType.IDENTIFIER) return { kind: ClassMemberLookAheadKind.NONE };

        pointer++;
        current = this.tokens[pointer];

        if (current?.tokenType === TokenType.L_PAREN) return { kind: ClassMemberLookAheadKind.METHOD };

        return { kind: ClassMemberLookAheadKind.FIELD };
    }

    private parseField(accessModifier: AccessModifierType): ClassMember {
        const statement = this.parseStatement();
        if (statement.type !== StatementType.DECLARATION_STATEMENT) throw Error('Declaration statement expected as field declaration');

        return {
            type: ClassMemberType.FIELD,
            accessModifier: accessModifier,
            statement: statement,
        };
    }

    private parseMethod(accessModifier: AccessModifierType): ClassMember {
        const functionDeclaration: FunctionDeclaration = this.parseFunctionDeclaration();

        return {
            type: ClassMemberType.METHOD,
            accessModifier: accessModifier,
            functionDeclaration: functionDeclaration,
        };
    }

    private parseConstructor(accessModifier: AccessModifierType): ClassMember {
        const name: string = this.expectNextToken(TokenType.IDENTIFIER).text;

        const parser = new FunctionParser(this.source, this.tokens, this.position);
        const params: FunctionParameter[] = parser.parseParameterList();
        this.position = parser.currentPosition;

        const body: Statement = this.parseStatement();
        if (body.type !== StatementType.BLOCK_STATEMENT) throw Error('Expected block statement after constructor declaration');

        return {
            type: ClassMemberType.CONSTRUCTOR,
            accessModifier: accessModifier,
            className: name,
            params: params,
            body: body,
        };
    }

    private parseNestedClass(accessModifier: AccessModifierType): NestedClassClassMember {
        const classDefinition: ClassDeclaration = this.parseClassDeclaration();

        return {
            type: ClassMemberType.NESTED_CLASS,
            accessModifier: accessModifier,
            classDefinition: classDefinition,
        };
    }

    private parseClassMembers(className: string): ClassMember[] {
        const members: ClassMember[] = [];

        let currentAccessModifier: AccessModifierType = AccessModifierType.public;

        let lookAheadResult: ClassMemberLookAheadResult;
        do {
            lookAheadResult = this.lookAheadForClassMember(className);

            switch (lookAheadResult.kind) {
                case ClassMemberLookAheadKind.FIELD:
                    members.push(this.parseField(currentAccessModifier));
                    break;
                case ClassMemberLookAheadKind.METHOD:
                    members.push(this.parseMethod(currentAccessModifier));
                    break;
                case ClassMemberLookAheadKind.CONSTRUCTOR:
                    members.push(this.parseConstructor(currentAccessModifier));
                    break;
                case ClassMemberLookAheadKind.NESTED_CLASS:
                    members.push(this.parseNestedClass(currentAccessModifier));
                    break;
                case ClassMemberLookAheadKind.ACCESS_MODIFIER:
                    const accessModifierString: string = this.expectNextToken(TokenType.KEYWORD).text;
                    currentAccessModifier = AccessModifierType[accessModifierString as keyof typeof AccessModifierType];
                    if (currentAccessModifier === undefined) throw Error(`Unknown access modifier: '${accessModifierString}'`);
                    this.expectNextToken(TokenType.COLON);
                    break;
            }
        } while (lookAheadResult.kind !== ClassMemberLookAheadKind.NONE);

        return members;
    }

    private parseClassInheritance(): ClassInheritance {
        this.expectNextToken(TokenType.COLON);

        let current: Token | null = this.peek();
        if (current === null) throw Error('Unexpected EOF');

        let isVirtual: boolean = false;
        if (current.tokenType === TokenType.KEYWORD && current.text === keywords.VIRTUAL.literal) {
            this.expectNextToken(TokenType.KEYWORD);
            isVirtual = true;
        }

        const bases: InheritanceBaseClass[] = [];

        do {
            const accessModifierString: string = this.expectNextToken(TokenType.KEYWORD).text;
            const accessModifier: AccessModifierType = AccessModifierType[accessModifierString as keyof typeof AccessModifierType];
            if (accessModifier === undefined) throw Error(`Unknown access modifier: '${accessModifierString}'`);

            const className: ClassName = this.parseClassName();
            bases.push({ accessModifier: accessModifier, className: className });

            if (this.peek()?.tokenType !== TokenType.L_BRACE) this.expectNextToken(TokenType.COMMA);
        } while (this.peek()?.tokenType !== TokenType.L_BRACE);

        return {
            isVirtual: isVirtual,
            bases: bases,
        };
    }

    private parseClassDefinition(className: ClassName): ClassDefinition | null {
        let inheritance: ClassInheritance | null = null;
        if (this.peek()?.tokenType === TokenType.COLON) inheritance = this.parseClassInheritance();

        if (inheritance === null && this.peek()?.tokenType === TokenType.SEMI) return null;

        this.expectNextToken(TokenType.L_BRACE);

        const members: ClassMember[] | null = this.parseClassMembers(className.name);

        this.expectNextToken(TokenType.R_BRACE);

        return {
            inheritance: inheritance,
            members: members,
        };
    }

    public parseClassDeclaration(): ClassDeclaration {
        this.expectNextToken(TokenType.KEYWORD, keywords.CLASS.literal);

        const className: ClassName = this.parseClassName();
        const definition: ClassDefinition | null = this.parseClassDefinition(className);

        this.expectNextToken(TokenType.SEMI);

        return {
            className: className,
            definition: definition,
        };
    }
}
