import React from "react";

export const KeyboardProvider = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

export const KeyboardAvoidingView = ({
  children,
  ...props
}: {
  children: React.ReactNode;
}) => React.createElement("KeyboardAvoidingView", props, children);

export const KeyboardAwareScrollView = ({
  children,
  ...props
}: {
  children: React.ReactNode;
}) => React.createElement("KeyboardAwareScrollView", props, children);

export const useKeyboardHandler = () => {};

export default {
  KeyboardProvider,
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
  useKeyboardHandler,
};
