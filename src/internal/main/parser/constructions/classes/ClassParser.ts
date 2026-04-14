import ConstructionParserUtils from '../../generics/ConstructionParserUtils';
import Token from '../../../../core/entities/token/Token';
import ClassMemberLookAheadResult from '../../entities/ClassMemberLookAheadResult';
import ClassMemberLookAheadKind from '../../entities/ClassMemberLookAheadKind';
import TokenType from '../../../../core/entities/token/TokenType';
import { keywords } from '../../../../core/entities/keyword/keywords/keywords';
import ClassMember from '../../../../core/entities/ast/constructions/classes/members/ClassMember';
import ClassDeclaration from '../../../../core/entities/ast/constructions/classes/ClassDeclaration';
import StatementType from '../../../../core/entities/ast/statements/StatementType';
import ClassMemberType from '../../../../core/entities/ast/constructions/classes/members/ClassMemberType';
import AccessModifierType from '../../../../core/entities/modifier/access/AccessModifierType';
import Statement from '../../../../core/entities/ast/statements/Statement';
import NestedClassClassMember from '../../../../core/entities/ast/constructions/classes/members/members/NestedClassClassMember';
import ClassInheritance from '../../../../core/entities/ast/constructions/classes/inheritance/ClassInheritance';
import ClassDefinition from '../../../../core/entities/ast/constructions/classes/ClassDefinition';
import ClassName from '../../../../core/entities/ast/constructions/classes/ClassName';
import InheritanceBaseClass from '../../../../core/entities/ast/constructions/classes/inheritance/InheritanceBaseClass';
import MethodParser from './MethodParser';
import MethodDeclaration from '../../../../core/entities/ast/constructions/classes/methods/MethodDeclaration';
import ASTNodeType from '../../../../core/entities/ast/ASTNodeType';
import ConstructorParser from './ConstructorParser';
import ConstructorDeclaration from '../../../../core/entities/ast/constructions/classes/constructors/ConstructorDeclaration';
import { CallableParser } from '../CallableParser';
import { operators } from '../../../../core/entities/operator/operators/operators';
import DestructorDeclaration from '../../../../core/entities/ast/constructions/classes/destructors/DestructorDeclaration';
import DestructorParser from './DestructorParser';

export default class ClassParser extends ConstructionParserUtils {
    private parseMethodDeclaration(accessModifier: AccessModifierType): MethodDeclaration {
        const parser = new MethodParser(this.source, this.tokens, this.position);
        const result: MethodDeclaration = parser.parseMethodDeclaration(accessModifier);
        this.position = parser.currentPosition;
        return result;
    }

    private skipCallablePrefixModifiersFrom(start: number): number {
        const parser = new CallableParser(this.source, this.tokens, start);
        parser.parseCallablePrefixModifiers();
        return parser.currentPosition;
    }

    private parseConstructorDeclaration(
        accessModifier: AccessModifierType,
        className: ClassName,
        inheritance: ClassInheritance | null,
    ): ConstructorDeclaration {
        const parser = new ConstructorParser(this.source, this.tokens, this.position);
        const result: ConstructorDeclaration = parser.parseConstructorDeclaration(accessModifier, className, inheritance);
        this.position = parser.currentPosition;
        return result;
    }

    private parseDestructorDeclaration(accessModifier: AccessModifierType, className: ClassName) {
        const parser = new DestructorParser(this.source, this.tokens, this.position);
        const result: DestructorDeclaration = parser.parseDestructorDeclaration(accessModifier, className);
        this.position = parser.currentPosition;
        return result;
    }

    private parseClassName(): ClassName {
        return this.parseGenericName() as ClassName; // TODO: Is this ok?
    }

    private lookAheadForClassMember(className: ClassName): ClassMemberLookAheadResult {
        let pointer: number = this.position;
        let current: Token | undefined = this.tokens[pointer];

        if (!current) return { kind: ClassMemberLookAheadKind.NONE };

        if (current.tokenType === TokenType.KEYWORD && current.text === keywords.CLASS.literal) {
            return { kind: ClassMemberLookAheadKind.NESTED_CLASS };
        }

        if (
            current.tokenType === TokenType.KEYWORD &&
            (current.text === keywords.PUBLIC?.literal || current.text === keywords.PRIVATE?.literal || current.text === keywords.PROTECTED?.literal) &&
            this.tokens[pointer + 1]?.tokenType === TokenType.COLON
        ) {
            return { kind: ClassMemberLookAheadKind.ACCESS_MODIFIER };
        }

        pointer = this.skipCallablePrefixModifiersFrom(pointer);
        current = this.tokens[pointer];
        if (!current) return { kind: ClassMemberLookAheadKind.NONE };

        // Destructor: ~ClassName(
        if (
            current.tokenType === TokenType.OPERATOR &&
            current.text === operators.bitwiseNot.literal &&
            this.tokens[pointer + 1]?.tokenType === TokenType.IDENTIFIER &&
            this.tokens[pointer + 1]?.text === className.name.name &&
            this.tokens[pointer + 2]?.tokenType === TokenType.L_PAREN
        ) {
            return { kind: ClassMemberLookAheadKind.DESTRUCTOR };
        }

        // Constructor: ClassName(
        if (current.tokenType === TokenType.IDENTIFIER && current.text === className.name.name && this.tokens[pointer + 1]?.tokenType === TokenType.L_PAREN) {
            return { kind: ClassMemberLookAheadKind.CONSTRUCTOR };
        }

        try {
            const { endPosition } = this.typeLookAhead(pointer);
            pointer = endPosition;
        } catch {
            return { kind: ClassMemberLookAheadKind.NONE };
        }

        current = this.tokens[pointer];
        if (!current || current.tokenType !== TokenType.IDENTIFIER) {
            return { kind: ClassMemberLookAheadKind.NONE };
        }

        pointer++;
        current = this.tokens[pointer];

        if (current?.tokenType === TokenType.L_PAREN) {
            return { kind: ClassMemberLookAheadKind.METHOD };
        }

        return { kind: ClassMemberLookAheadKind.FIELD };
    }

    private parseField(accessModifier: AccessModifierType): ClassMember {
        const statement: Statement = this.parseStatement();
        if (statement.type !== StatementType.DECLARATION_STATEMENT) throw Error('Declaration statement expected as field declaration');

        return {
            nodeType: ASTNodeType.DECLARATION,
            type: ClassMemberType.FIELD,
            accessModifier: accessModifier,
            statement: statement,
        };
    }

    private parseMethod(accessModifier: AccessModifierType): ClassMember {
        const methodDeclaration: MethodDeclaration = this.parseMethodDeclaration(accessModifier);

        return {
            nodeType: ASTNodeType.DECLARATION,
            type: ClassMemberType.METHOD,
            accessModifier: accessModifier,
            methodDeclaration: methodDeclaration,
        };
    }

    private parseConstructor(accessModifier: AccessModifierType, className: ClassName, inheritance: ClassInheritance | null): ClassMember {
        const constructorDeclaration: ConstructorDeclaration = this.parseConstructorDeclaration(accessModifier, className, inheritance);

        return {
            nodeType: ASTNodeType.DECLARATION,
            type: ClassMemberType.CONSTRUCTOR,
            accessModifier: accessModifier,
            constructorDeclaration: constructorDeclaration,
        };
    }

    private parseDestructor(accessModifier: AccessModifierType, className: ClassName): ClassMember {
        const destructorDeclaration: DestructorDeclaration = this.parseDestructorDeclaration(accessModifier, className);

        return {
            nodeType: ASTNodeType.DECLARATION,
            type: ClassMemberType.DESTRUCTOR,
            accessModifier: accessModifier,
            destructorDeclaration: destructorDeclaration,
        };
    }

    private parseNestedClass(accessModifier: AccessModifierType): NestedClassClassMember {
        const classDefinition: ClassDeclaration = this.parseClassDeclaration();

        return {
            nodeType: ASTNodeType.DECLARATION,
            type: ClassMemberType.NESTED_CLASS,
            accessModifier: accessModifier,
            classDefinition: classDefinition,
        };
    }

    private parseMembers(className: ClassName, inheritance: ClassInheritance | null): ClassMember[] {
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
                    members.push(this.parseConstructor(currentAccessModifier, className, inheritance));
                    break;
                case ClassMemberLookAheadKind.DESTRUCTOR:
                    members.push(this.parseDestructor(currentAccessModifier, className));
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

    private parseInheritance(): ClassInheritance {
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
        if (this.peek()?.tokenType === TokenType.COLON) inheritance = this.parseInheritance();

        if (inheritance === null && this.peek()?.tokenType === TokenType.SEMI) return null;

        this.expectNextToken(TokenType.L_BRACE);

        const members: ClassMember[] | null = this.parseMembers(className, inheritance);

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
            nodeType: ASTNodeType.DECLARATION,
            className: className,
            definition: definition,
        };
    }
}
