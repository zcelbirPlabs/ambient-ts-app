import styled from 'styled-components';
import * as d3 from 'd3';

const FloatingToolbarSettingsContainer = styled.div`
    background: #242f3f;
    margin-top: 4px;
    border-radius: 3px;
    box-shadow: 4px 4px 6px #0d1117;

    padding: 4px;

    width: 100%;

    min-width: 310px;
`;

const OptionColorContainer = styled.div`
    align-items: center;
    justify-content: center;

    height: 20px;

    display: flex;
`;

const OptionColor = styled.div<{
    backgroundColor: string | undefined;
    disabled: boolean;
    isFibColor?: boolean;
}>`
    ${({ backgroundColor, isFibColor, disabled }) => {
        if (backgroundColor) {
            const fibLevelColor = d3.color(backgroundColor);

            if (fibLevelColor && isFibColor) {
                fibLevelColor.opacity = disabled ? 0.4 : 1.2;
                return 'background: ' + fibLevelColor.toString() + ';';
            } else {
                return 'background: ' + backgroundColor + ';';
            }
        }
    }}

    align-items: center;
    justify-content: center;

    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

    border-radius: 1.5px;

    border-width: 0.5px;
    border-style: solid;
    border-color: ${({ disabled }) =>
        disabled ? 'rgba(121, 133, 148, 0.2)' : 'rgba(121, 133, 148, 0.7)'};

    height: 20px;
    width: 20px;

    display: flex;
`;

const OptionStyleContainer = styled.div<{
    disabled: boolean;
}>`
    background: ${({ disabled }) => (disabled ? '#242f3f' : '#2f3d52')};
    align-items: center;
    justify-content: center;

    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

    border-radius: 2px;

    border-width: 1.5px;
    border-style: solid;
    border-color: ${({ disabled }) =>
        disabled ? 'rgba(121, 133, 148, 0.7)' : 'rgba(121, 133, 148, 1)'};

    height: 20px;
    width: 32px;

    padding: 1px;
    display: flex;

    &:hover {
        filter: ${({ disabled }) =>
            disabled ? 'brightness(1)' : 'brightness(1.2)'};
    }
`;

const LabelStyleContainer = styled.div`
    background: #242f3f;
    align-items: center;
    justify-content: start;
    cursor: pointer;

    font-size: 13px;
    color: rgba(204, 204, 204);

    width: 60px;

    display: flex;

    &:hover {
        font-size: 15px;
        font-weight: bold;
    }
`;

const ColorPickerTab = styled.div`
    display: flex;

    align-items: center;

    margin: 4px;
    padding: 4px;

    justify-content: center;
`;

const LineContainer = styled.div`
    align-items: center;

    justify-content: center;
`;

const LevelTitle = styled.div`
    font-size: 12px;
    color: rgba(204, 204, 204);
`;

const InfoLabel = styled.div`
    display: flex;
    font-size: 12px;
    color: rgba(204, 204, 204);

    align-items: center;

    justify-content: center;
`;

const LineSettings = styled.div`
    background: #242f3f;
    align-items: center;

    padding: 4px;
    gap: 10px;

    display: grid;
    grid-template-columns: 50% 50%;
`;

const LineSettingsLeft = styled.div`
    align-items: center;
    justify-content: center;
    display: grid;
    grid-template-columns: 30% 70%;

    gap: 10px;
`;

const LineSettingsRight = styled.div`
    align-items: center;
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    gap: 10px;
`;

const ExtendSettings = styled.div`
    align-items: center;
    display: grid;
    grid-template-columns: 25% 70%;

    gap: 10px;
`;

const FibLineSettings = styled.div`
    background: #242f3f;
    align-items: center;

    padding: 5px 5px 0 5px;
    gap: 10px;

    display: grid;
    grid-template-columns: repeat(2, 1fr);
`;

const FibLineOptions = styled.div`
    align-items: center;
    justify-content: center;
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    gap: 10px;
`;

const StyledLabel = styled.div`
    color: rgba(204, 204, 204);
    padding-left: 7px;
    padding-top: 2px;
    font-size: 13px;
`;

const DropDownContainer = styled.div`
    position: relative;

    align-items: center;
    justify-content: center;

    margin: 0 auto;
`;

const DropDownHeader = styled.div`
    padding: 4px;

    grid-template-columns: repeat(2, 1fr);
    justify-content: space-around;

    display: flex;

    border-radius: 3px;

    border-width: 1.5px;
    border-style: solid;
    border-color: rgba(121, 133, 148, 0.7);

    font-size: 13px;
    color: rgba(204, 204, 204);
    background: #2f3d52;

    align-items: center;

    cursor: pointer;

    width: 75px;

    &:hover {
        border-color: rgba(121, 133, 148, 1);
    }
`;

const DropDownListContainer = styled.div`
    position: absolute;
    &:first-child {
        padding-top: 5px;
    }
`;

const DropDownList = styled.ul`
    padding: 0;
    margin: 0;

    width: 75px;

    background: var(--dark3);

    box-sizing: border-box;

    color: rgba(204, 204, 204);
    font-size: 13px;

    border: 1px solid #434c58;
    box-sizing: border-box;

    cursor: pointer;
`;

const ListItem = styled.ul<{
    backgroundColor: string | undefined;
}>`
    padding: 5px 10px 5px 10px;

    background: ${({ backgroundColor }) =>
        backgroundColor ? backgroundColor : 'transparent'};

    display: flex;

    align-items: center;
    justify-content: center;

    &:hover {
        background: #434c58;
    }
`;

const CheckboxContainer = styled.div`
    display: flex;

    align-items: center;
    justify-content: center;

    vertical-align: middle;
`;

const Icon = styled.svg`
    fill: none;
    stroke: white;
    stroke-width: 2px;
`;

const StyledCheckbox = styled.div<{
    checked: boolean | undefined;
    disabled: boolean | undefined;
}>`
    width: 17px;
    height: 17px;
    background: ${({ checked, disabled }) =>
        checked ? (disabled ? '#434c58' : '#2196F3') : '#f0f0f8'};

    border-radius: 2px;
    transition: all 50ms;

    ${Icon} {
        visibility: ${({ checked }) => (checked ? 'visible' : 'hidden')};
    }

    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

    &:hover {
        filter: ${({ disabled }) =>
            disabled ? 'brightness(1)' : 'brightness(1.2)'};
    }
`;

const LineWidthOptions = styled.div<{
    backgroundColor: string | undefined;
}>`
    border: 0 solid
        ${({ backgroundColor }) =>
            backgroundColor ? backgroundColor : '#8b98a5'};
    height: 0;
    width: 20px;
`;

const LabelSettingsContainer = styled.div`
    background: #242f3f;
    align-items: center;

    padding: 0 5px 0 0;
    gap: 5px;

    display: grid;
    grid-template-columns: 1fr 1fr 0.5fr;
`;

const LabelSettingsArrow = styled.span<{ isActive: boolean }>`
    ${({ isActive }) => {
        if (isActive) {
            return `
                margin-top: 2.5px;
                transform: rotate(315deg);
            `;
        } else {
            return `
            margin-top: -2.5px;
            transform: rotate(135deg);
            `;
        }
    }}

    display: inline-block;
    width: 5px;
    height: 5px;
    border-top: 1px solid #dbdbdb;
    border-right: 1px solid #dbdbdb;
    transition: all 600ms;
`;

const SliderContainer = styled.div`
    position: relative;

    align-items: center;
    justify-content: center;

    width: 110px;
    height: 12px;

    border-radius: 2px;

    border: 1px solid rgba(47, 90, 181, 0.5);

    margin: 0 auto;
`;

export {
    FloatingToolbarSettingsContainer,
    LineSettings,
    OptionColorContainer,
    OptionStyleContainer,
    ColorPickerTab,
    LineContainer,
    LevelTitle,
    InfoLabel,
    LineSettingsLeft,
    LineSettingsRight,
    OptionColor,
    FibLineSettings,
    FibLineOptions,
    ExtendSettings,
    LabelStyleContainer,
    StyledLabel,
    DropDownContainer,
    DropDownHeader,
    DropDownListContainer,
    DropDownList,
    ListItem,
    StyledCheckbox,
    CheckboxContainer,
    Icon,
    LineWidthOptions,
    LabelSettingsContainer,
    LabelSettingsArrow,
    SliderContainer,
};