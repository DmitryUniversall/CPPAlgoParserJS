import AccessModifierType from '../../../../core/entities/modifier/access/AccessModifierType';
import ConstructorDeclaration from '../../../../core/entities/ast/constructions/classes/constructors/ConstructorDeclaration';
import ClassName from '../../../../core/entities/ast/constructions/classes/ClassName';
import ClassInheritance from '../../../../core/entities/ast/constructions/classes/inheritance/ClassInheritance';
import ConstructorInitializerTargetType from '../../../../core/entities/ast/constructions/classes/constructors/initializers/ConstructorInitializerTargetType';
import CallableParameter from '../../../../core/entities/ast/constructions/callable/params/CallableParameter';
import TokenType from '../../../../core/entities/token/TokenType';
import ConstructorInitializer from '../../../../core/entities/ast/constructions/classes/constructors/initializers/ConstructorInitializer';
import CallableDefinition from '../../../../core/entities/ast/constructions/callable/definitions/CallableDefinition';
import MethodPostfixModifierType from '../../../../core/entities/ast/constructions/classes/methods/modifiers/MethodModifierType';
import CallablePostfixModifierType from '../../../../core/entities/ast/constructions/callable/modifiers/CallablePostfixModifierType';
import CallablePrefixModifierType from '../../../../core/entities/ast/constructions/callable/modifiers/CallablePrefixModifierType';
import MethodParser from './MethodParser';
import ASTNodeType from '../../../../core/entities/ast/ASTNodeType';
import ConstructorDefinition from '../../../../core/entities/ast/constructions/classes/constructors/ConstructorDefinition';
import Token from '../../../../core/entities/token/Token';
import ConstructorInitializerValue from '../../../../core/entities/ast/constructions/classes/constructors/initializers/ConstructorInitializerValue';
import Expression from '../../../../core/entities/ast/expressions/Expression';
import ConstructorInitializerValueType from '../../../../core/entities/ast/constructions/classes/constructors/initializers/ConstructorInitializerValueType';
import InheritanceBaseClass from '../../../../core/entities/ast/constructions/classes/inheritance/InheritanceBaseClass';
import { operators } from '../../../../core/entities/operator/operators/operators';

export default class ConstructorParser extends MethodParser {
    private parseClassName(): ClassName {
        // TODO: Duplicate from ClassParser
        return this.parseGenericName() as ClassName;
    }

    private isSameClassName(name: ClassName, className: ClassName): boolean {
        return name.name.name === className.name.name;
    }

    private resolveConstructorInitializerTargetType(targetName: ClassName | string, currentClassName: ClassName): ConstructorInitializerTargetType {
        if (typeof targetName !== 'string') {
            if (this.isSameClassName(targetName, currentClassName)) {
                return ConstructorInitializerTargetType.DELEGATING;
            }

            // TODO: Check inheritance
            return ConstructorInitializerTargetType.BASE_CLASS;
        }

        return ConstructorInitializerTargetType.MEMBER;
    }

    private parseConstructorInitializerTarget(currentClassName: ClassName, inheritance: ClassInheritance | null): ClassName | string {
        const first: Token | null = this.peek();
        if (first === null) throw Error('Unexpected EOF while parsing constructor initializer target');

        if (first.tokenType !== TokenType.IDENTIFIER) throw Error('Identifier expected in constructor initializer target');

        const startName: string = first.text;

        const second: Token | null = this.peekOffset(1);

        if (second?.text === operators.lt.literal) return this.parseClassName();

        if (second?.tokenType === TokenType.L_PAREN || second?.tokenType === TokenType.L_BRACE) {
            this.next();

            if (startName === currentClassName.name.name) return this.parseClassName();

            // TODO: Check inheritance chain
            const baseMatch: InheritanceBaseClass | undefined = inheritance?.bases.find((base) => base.className.name.name === startName);
            if (baseMatch !== undefined) return baseMatch.className;

            return startName;
        }

        return startName;
    }

    private parseExpressionListInParentheses(): Expression[] {
        // TODO: can be nested: value(a, (b, c), d)
        this.expectNextToken(TokenType.L_PAREN);

        const expressions: Expression[] = [];

        if (this.peek()?.tokenType === TokenType.R_PAREN) {
            this.expectNextToken(TokenType.R_PAREN);
            return expressions;
        }

        do {
            expressions.push(this.parseExpression());

            if (this.peek()?.tokenType !== TokenType.COMMA) break;
            this.expectNextToken(TokenType.COMMA);
        } while (true);

        this.expectNextToken(TokenType.R_PAREN);

        return expressions;
    }

    private parseExpressionListInBraces(): Expression[] {
        // TODO: Can be nested: value{{1, 2}, {3, 4}}
        this.expectNextToken(TokenType.L_BRACE);

        const expressions: Expression[] = [];

        if (this.peek()?.tokenType === TokenType.R_BRACE) {
            this.expectNextToken(TokenType.R_BRACE);
            return expressions;
        }

        do {
            expressions.push(this.parseExpression());

            if (this.peek()?.tokenType !== TokenType.COMMA) break;
            this.expectNextToken(TokenType.COMMA);
        } while (true);

        this.expectNextToken(TokenType.R_BRACE);

        return expressions;
    }

    private parseConstructorInitializerValue(): ConstructorInitializerValue {
        const current: Token | null = this.peek();
        if (current === null) throw Error('Unexpected EOF while parsing constructor initializer value');

        if (current.tokenType === TokenType.L_PAREN) {
            const args: Expression[] = this.parseExpressionListInParentheses();

            return {
                type: ConstructorInitializerValueType.PAREN,
                args,
            };
        }

        if (current.tokenType === TokenType.L_BRACE) {
            const args: Expression[] = this.parseExpressionListInBraces();

            return {
                type: ConstructorInitializerValueType.BRACE,
                args,
            };
        }

        throw Error(`Expected "(" or "{" in constructor initializer, got '${current.text}'`);
    }

    private parseConstructorInitializer(currentClassName: ClassName, inheritance: ClassInheritance | null): ConstructorInitializer {
        const targetName: string | ClassName = this.parseConstructorInitializerTarget(currentClassName, inheritance);
        const targetType: ConstructorInitializerTargetType = this.resolveConstructorInitializerTargetType(targetName, currentClassName);
        const value: ConstructorInitializerValue = this.parseConstructorInitializerValue();

        switch (targetType) {
            case ConstructorInitializerTargetType.MEMBER:
                if (typeof targetName !== 'string') throw Error('Member initializer target must be a field name');

                return {
                    targetType: ConstructorInitializerTargetType.MEMBER,
                    targetName: targetName,
                    value: value,
                };

            case ConstructorInitializerTargetType.BASE_CLASS:
                if (typeof targetName === 'string') throw Error('Base class initializer target must be a class name');

                return {
                    targetType: ConstructorInitializerTargetType.BASE_CLASS,
                    targetName: targetName,
                    value: value,
                };

            case ConstructorInitializerTargetType.DELEGATING:
                if (typeof targetName === 'string') throw Error('Delegating initializer target must be a class name');

                return {
                    targetType: ConstructorInitializerTargetType.DELEGATING,
                    targetName: targetName,
                    value,
                };
        }
    }

    private parseConstructorInitializerList(currentClassName: ClassName, inheritance: ClassInheritance | null): ConstructorInitializer[] {
        this.expectNextToken(TokenType.COLON);

        const initializers: ConstructorInitializer[] = [];

        do {
            initializers.push(this.parseConstructorInitializer(currentClassName, inheritance));

            if (this.peek()?.tokenType !== TokenType.COMMA) break;
            this.expectNextToken(TokenType.COMMA);
        } while (true);

        return initializers;
    }

    public parseConstructorDeclaration(
        accessModifier: AccessModifierType,
        currentClassName: ClassName,
        inheritance: ClassInheritance | null,
    ): ConstructorDeclaration {
        const callablePrefixModifiers: CallablePrefixModifierType[] = this.parseCallablePrefixModifiers();

        const name: ClassName = { name: this.parseQualifiedName(), typeParams: [] };
        const params: CallableParameter[] = this.parseCallableParameterList();

        const callablePostfixModifiers: CallablePostfixModifierType[] = this.parseCallablePostfixModifiers();
        const methodPostfixModifiers: MethodPostfixModifierType[] = this.parseMethodPostfixModifiers();

        let initializerList: ConstructorInitializer[] | null = null;
        if (this.peek()?.tokenType === TokenType.COLON) {
            initializerList = this.parseConstructorInitializerList(currentClassName, inheritance);
        }

        const callableDefinition: CallableDefinition | null = this.parseOptionalCallableDefinition({ allowPureSpecifier: true });

        if (initializerList !== null && callableDefinition === null)
            throw new Error(`Callable definition expected after initializer list for constructor '${currentClassName.name.name}'`);

        const definition: ConstructorDefinition = {
            callableDefinition: callableDefinition,
            initializerList: initializerList,
        };

        return {
            nodeType: ASTNodeType.DECLARATION,
            accessModifier: accessModifier,
            name: name,
            params: params,
            callablePrefixModifiers: callablePrefixModifiers,
            callablePostfixModifiers: callablePostfixModifiers,
            methodPostfixModifiers: methodPostfixModifiers,
            definition: definition,
        };
    }
}
