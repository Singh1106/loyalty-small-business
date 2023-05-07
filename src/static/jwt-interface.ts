export interface JwtTokenPayload {
  sub: string;
  iat?: number;
  exp?: number;
}
