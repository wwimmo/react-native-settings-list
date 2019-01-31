"use strict";

import React from "react";
import PropTypes from "prop-types";
import createReactClass from "create-react-class";

import {
    View,
    TouchableOpacity,
    TouchableNativeFeedback,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Switch,
    Image,
    ViewPropTypes,
    Platform
} from "react-native";

const ARROW_ICON = require("./img/icon-arrow-settings.png");

const Touchable = (props) => {
    const content = getNativeButton(props);
    return content;
};

function getNativeButton(props) {
    if (Platform.OS === "android") {
        const androidRippleStyle = props.androidRippleColor
            ? TouchableNativeFeedback.Ripple(props.androidRippleColor, props.androidRippleBorderless)
            : TouchableNativeFeedback.Ripple("rgba(0, 0, 0, 0.15)", props.androidRippleBorderless);
        return (
            <TouchableNativeFeedback
                onPress={props.onPress}
                onLongPress={props.onLongPress}
                background={androidRippleStyle}
                useForeground={props.androidRippleUseForeground}
                accessible={false}
                ref={props.ref}
                accessible={props.accessible}
            >
                {props.children}
            </TouchableNativeFeedback>
        );
    } else {
        return (
            <TouchableOpacity
                onPress={props.onPress}
                onLongPress={props.onLongPress}
                accessible={false}
                ref={props.ref}
                accessible={props.accessible}
            >
                {props.children}
            </TouchableOpacity>
        );
    }
}

class SettingsList extends React.Component {
    static propTypes = {
        backgroundColor: PropTypes.string,
        borderColor: PropTypes.string,
        defaultItemSize: PropTypes.number,
        underlayColor: PropTypes.string,
        defaultTitleStyle: Text.propTypes.style,
        defaultTitleInfoPosition: PropTypes.string,
        scrollViewProps: PropTypes.object,
        defaultAllowFontScaling: PropTypes.bool
    };

    static defaultProps = {
        backgroundColor: "white",
        borderColor: "black",
        defaultItemSize: 50,
        underlayColor: "transparent",
        defaultTitleStyle: { fontSize: 16 },
        defaultAllowFontScaling: true
    };

    _getGroups() {
        var groupNumber = -1;
        let headers = [];
        let itemGroup = [];
        let result = [];
        React.Children.forEach(this.props.children, (child) => {
            // Allow for null, optional fields
            if (!child) return;

            if (child.type.displayName === "Header") {
                if (groupNumber != -1) {
                    result[groupNumber] = {
                        items: itemGroup,
                        header: headers[groupNumber]
                    };
                    itemGroup = [];
                }
                groupNumber++;
                headers[groupNumber] = child.props;
            } else if (child.type.displayName === "Item") {
                if (groupNumber == -1) {
                    groupNumber++;
                }
                itemGroup.push(child.props);
            } else {
                if (groupNumber == -1) {
                    groupNumber++;
                }
                itemGroup.push(child);
            }
        });
        result[groupNumber] = { items: itemGroup, header: headers[groupNumber] };
        return result;
    }

    render() {
        return (
            <ScrollView {...this.props.scrollViewProps}>
                {this._getGroups().map((group, index) => {
                    return this._groupView(group, index);
                })}
            </ScrollView>
        );
    }

    _groupView(group, index) {
        if (group.header) {
            let allowFontScaling =
                group.header.allowFontScaling != null
                    ? group.header.allowFontScaling
                    : this.props.defaultAllowFontScaling;
            return (
                <View key={"group_" + index}>
                    <Text
                        style={[{ margin: 5 }, group.header.headerStyle]}
                        allowFontScaling={allowFontScaling}
                        numberOfLines={group.header.headerNumberOfLines}
                        ellipsizeMode="tail"
                        ref={group.header.headerRef}
                    >
                        {group.header.headerText}
                    </Text>
                    {group.items.length ? (
                        <View
                            style={{
                                borderTopWidth: StyleSheet.hairlineWidth,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                borderColor: this.props.borderColor
                            }}
                        >
                            {group.items.map((item, index) => {
                                return this._itemView(item, index, group.items.length);
                            })}
                        </View>
                    ) : null}
                </View>
            );
        } else {
            let items;
            if (group.items.length > 0) {
                items = (
                    <View
                        style={{
                            borderTopWidth: StyleSheet.hairlineWidth,
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            borderColor: this.props.borderColor
                        }}
                    >
                        {group.items.map((item, index) => {
                            return this._itemView(item, index, group.items.length);
                        })}
                    </View>
                );
            }

            return <View key={"group_" + index}>{items}</View>;
        }
    }

    _itemEditableBlock(item, index, position) {
        return [
            <Text
                key={"itemTitle_" + index}
                style={[
                    item.titleStyle ? item.titleStyle : this.props.defaultTitleStyle,
                    position === "Bottom" ? null : styles.titleText
                ]}
            >
                {item.title}
            </Text>,
            item.isEditable ? (
                <TextInput
                    key={item.id}
                    style={item.editableTextStyle ? item.editableTextStyle : styles.editableText}
                    placeholder={item.placeholder}
                    onChangeText={(text) => item.onTextChange(text)}
                    value={item.value}
                    {...item.textInputProps}
                />
            ) : null
        ];
    }

    _itemTitleBlock(item, index, position) {
        let allowFontScaling =
            item.allowFontScaling != null ? item.allowFontScaling : this.props.defaultAllowFontScaling;

        return [
            <Text
                key={"itemTitle_" + index}
                style={[
                    item.titleStyle ? item.titleStyle : this.props.defaultTitleStyle,
                    position === "Bottom" ? null : styles.titleText
                ]}
                allowFontScaling={allowFontScaling}
            >
                {item.title}
            </Text>,
            item.titleInfo ? (
                <Text
                    key={"itemTitleInfo_" + index}
                    style={[
                        item.rightSideStyle ? item.rightSideStyle : position === "Bottom" ? null : styles.rightSide,
                        { color: "#B1B1B1" },
                        item.titleInfoStyle
                    ]}
                    allowFontScaling={allowFontScaling}
                >
                    {item.titleInfo}
                </Text>
            ) : null
        ];
    }

    _itemView(item, index, max) {
        var border;

        if (item.type) {
            return item;
        }

        if (item.borderHide) {
            switch (item.borderHide) {
                case "Top":
                    border = { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: this.props.borderColor };
                    break;
                case "Bottom":
                    border = { borderTopWidth: StyleSheet.hairlineWidth, borderColor: this.props.borderColor };
                    break;
            }
        } else {
            border =
                index === max - 1
                    ? { borderWidth: 0 }
                    : {
                          borderBottomWidth: StyleSheet.hairlineWidth,
                          borderColor: this.props.borderColor
                      };
        }

        let titleInfoPosition = item.titleInfoPosition ? item.titleInfoPosition : this.props.defaultTitleInfoPosition;
        let allowFontScaling =
            item.allowFontScaling != null ? item.allowFontScaling : this.props.defaultAllowFontScaling;

        return (
            <Touchable
                accessible={false}
                key={"item_" + index}
                onPress={item.onPress}
                onLongPress={item.onLongPress}
                ref={item.itemRef}
                androidRippleColor={item.underlayColor}
            >
                <View
                    style={
                        item.itemBoxStyle
                            ? item.itemBoxStyle
                            : [
                                  styles.itemBox,
                                  {
                                      backgroundColor: item.backgroundColor
                                          ? item.backgroundColor
                                          : this.props.backgroundColor
                                  }
                              ]
                    }
                >
                    {item.icon}
                    {item.isAuth ? (
                        <View style={[styles.titleBox, border, item.titleBoxStyle || {}]}>
                            <View style={{ paddingLeft: 5, flexDirection: "column", flex: 1 }}>
                                <View
                                    style={{
                                        borderBottomWidth: StyleSheet.hairlineWidth,
                                        borderColor: this.props.borderColor
                                    }}
                                >
                                    <TextInput
                                        onSubmitEditing={() => this.passwordInput.focus()}
                                        style={{ flex: 1, height: 30, borderBottomWidth: StyleSheet.hairlineWidth }}
                                        placeholder="username"
                                        allowFontScaling={allowFontScaling}
                                        {...item.authPropsUser}
                                    />
                                </View>
                                <View>
                                    <TextInput
                                        ref={(node) => (this.passwordInput = node)}
                                        style={{ flex: 1, height: 30 }}
                                        placeholder="password"
                                        secureTextEntry={true}
                                        returnKeyType={"go"}
                                        allowFontScaling={allowFontScaling}
                                        {...item.authPropsPW}
                                        onSubmitEditing={() => item.onPress()}
                                    />
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View
                            style={[
                                styles.titleBox,
                                border,
                                { minHeight: item.itemWidth ? item.itemWidth : this.props.defaultItemSize },
                                item.titleBoxStyle || {}
                            ]}
                        >
                            {titleInfoPosition === "Bottom" ? (
                                <View style={{ flexDirection: "column", flex: 1, justifyContent: "center" }}>
                                    {item.isEditable
                                        ? this._itemEditableBlock(item, index, "Bottom")
                                        : this._itemTitleBlock(item, index, "Bottom")}
                                </View>
                            ) : item.isEditable ? (
                                this._itemEditableBlock(item, index)
                            ) : (
                                this._itemTitleBlock(item, index)
                            )}

                            {item.rightSideContent ? item.rightSideContent : null}
                            {item.hasSwitch ? (
                                <Switch
                                    {...item.switchProps}
                                    style={styles.rightSide}
                                    onValueChange={(value) => item.switchOnValueChange(value)}
                                    value={item.switchState}
                                />
                            ) : null}
                            {this.itemArrowIcon(item)}
                        </View>
                    )}
                </View>
            </Touchable>
        );
    }

    itemArrowIcon(item) {
        if (item.arrowIcon) {
            return item.arrowIcon;
        }

        if (item.hasNavArrow) {
            return <Image style={[styles.rightSide, item.arrowStyle]} source={ARROW_ICON} />;
        }

        return null;
    }
}
module.exports = SettingsList;

const styles = StyleSheet.create({
    itemBox: {
        flex: 1,
        justifyContent: "center",
        flexDirection: "row"
    },
    titleBox: {
        flex: 1,
        marginLeft: 15,
        flexDirection: "row"
    },
    titleText: {
        flex: 1,
        alignSelf: "center"
    },
    rightSide: {
        marginRight: 15,
        alignSelf: "center"
    },
    editableText: {
        flex: 1,
        textAlign: "right",
        marginRight: 15
    }
});

/**
 * Optional Header for groups
 */
SettingsList.Header = createReactClass({
    propTypes: {
        headerText: PropTypes.string,
        headerStyle: Text.propTypes.style,
        headerRef: PropTypes.func,
        headerNumberOfLines: PropTypes.number
    },
    getDefaultProps() {
        return {
            headerNumberOfLines: 1
        };
    },
    /**
     * not directly rendered
     */
    render() {
        return null;
    }
});

/**
 * Individual Items in the Settings List
 */
SettingsList.Item = createReactClass({
    propTypes: {
        /**
         * Title being displayed
         */
        title: PropTypes.string,
        titleStyle: Text.propTypes.style,
        /**
         * Icon displayed on the left of the settings item
         */
        icon: PropTypes.node,

        /**
         * Item Box Style
         */
        itemBoxStyle: ViewPropTypes.style,
        /**
         * Title Box Style
         */
        titleBoxStyle: ViewPropTypes.style,
        /**
         * Right Side Style
         */
        rightSideStyle: ViewPropTypes.style,
        /**
         * Editable Right Side Style
         */
        editableTextStyle: Text.propTypes.style,

        /**
         * Individual item width.  Can be globally set in the parent.  Will become deprecated
         */
        itemWidth: PropTypes.number,
        /**
         * Allows for the item to become an auth item
         */
        isAuth: PropTypes.bool,
        authPropsUser: PropTypes.object,
        authPropsPW: PropTypes.object,
        /**
         * Individual background color. Can be globally set in the parent. Will become Deprecated
         */
        backgroundColor: PropTypes.string,

        /**
         * Individual underlay click color.  Can be globally set in the parent.
         */
        underlayColor: PropTypes.string,
        /**
         * Item on press callback.
         */
        onPress: PropTypes.func,
        /**
         * Item on long press callback.
         */
        onLongPress: PropTypes.func,
        /**
         * Enable or disable the > arrow at the end of the setting item.
         */
        hasNavArrow: PropTypes.bool,
        arrowIcon: PropTypes.node,

        arrowStyle: Image.propTypes.style,
        /**
         * Enable or disable a Switch component
         */
        hasSwitch: PropTypes.bool,
        /**
         * Switch state
         */
        switchState: PropTypes.bool,
        /**
         * Switch props
         */
        switchProps: PropTypes.object,
        /**
         * On value change callback
         */
        switchOnValueChange: PropTypes.func,
        /**
         * Right side information on the setting item
         */
        titleInfo: PropTypes.string,
        titleInfoStyle: Text.propTypes.style,
        /**
         * If 'Bottom', info is placed beneath the title
         */
        titleInfoPosition: PropTypes.string,
        /**
         * Right side content
         */
        rightSideContent: PropTypes.node,
        /* Gives opens to hide specific borders */
        borderHide: PropTypes.oneOf(["Top", "Bottom", "Both"]),

        itemRef: PropTypes.func
    },
    getDefaultProps() {
        return {
            hasNavArrow: true
        };
    },
    /**
     * not directly rendered
     */
    render() {
        return null;
    }
});
