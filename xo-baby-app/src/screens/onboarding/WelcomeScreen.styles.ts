import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  logo: { width: 100, height: 100 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 22 },
  button: {
    backgroundColor: '#00c4cc',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 32,
    marginVertical: 10,
    width: '100%',
    height: 48,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', justifyContent: 'center', textAlign: 'center' },  
  forgot: { color: '#1e90ff', marginTop: 10 },
  or: { marginVertical: 10, color: '#555' },
  socialButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#DCE3E3',
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  socialText: { fontSize: 15 },
  signupText: { marginTop: 15, color: '#444' },
  signupLink: { color: '#1e90ff' },
  termsText: {
    fontSize: 12,
    color: '#777',
    marginTop: 20,
    textAlign: 'center',
  },
  link: { color: '#1e90ff' },
});